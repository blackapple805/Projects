// Command web serves a browser UI for the scraper.
//
//	go run ./cmd/web            # HTTPS on localhost:8443 (self-signed)
//	go run ./cmd/web -http      # plain HTTP, no browser warning
//	go run ./cmd/web -addr :9000
package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/json"
	"encoding/pem"
	"flag"
	"fmt"
	"log"
	"math/big"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"concurrent-web-scraper/internal/scrape"
)

var scraper = scrape.New(scrape.WithConcurrency(8))

func main() {
	addr := flag.String("addr", "localhost:8443", "host:port")
	useHTTP := flag.Bool("http", false, "serve plain HTTP (no cert warning)")
	certFile := flag.String("cert", "certs/localhost.pem", "TLS certificate file (mkcert)")
	keyFile := flag.String("key", "certs/localhost-key.pem", "TLS key file (mkcert)")
	flag.Parse()

	mux := http.NewServeMux()
	mux.HandleFunc("/", handleIndex)
	mux.HandleFunc("/scrape", handleScrape)

	if *useHTTP {
		banner("http", *addr)
		if err := http.ListenAndServe(*addr, mux); err != nil {
			log.Fatal(err)
		}
		return
	}

	srv := &http.Server{
		Addr:     *addr,
		Handler:  mux,
		ErrorLog: log.New(tlsNoiseFilter{}, "", log.LstdFlags),
	}

	// Prefer a real, browser-trusted cert if the files exist (e.g. generated
	// by `mkcert localhost`). This gives a green padlock with no warning.
	// Otherwise fall back to an in-memory self-signed cert so the project
	// still runs for anyone who clones it without mkcert installed.
	if fileExists(*certFile) && fileExists(*keyFile) {
		banner("https", *addr)
		fmt.Printf("   using trusted cert: %s\n", *certFile)
		if err := srv.ListenAndServeTLS(*certFile, *keyFile); err != nil {
			log.Fatal(err)
		}
		return
	}

	cert, err := selfSignedCert()
	if err != nil {
		log.Fatalf("generating certificate: %v", err)
	}
	srv.TLSConfig = &tls.Config{
		Certificates: []tls.Certificate{cert},
		MinVersion:   tls.VersionTLS12,
	}
	banner("https", *addr)
	fmt.Println("   No mkcert files found - using self-signed cert.")
	fmt.Println("   Browser will warn: click Advanced -> Proceed. (See README for mkcert.)")
	fmt.Println("   Or run with -http for a plain-HTTP page (no warning).")
	if err := srv.ListenAndServeTLS("", ""); err != nil {
		log.Fatal(err)
	}
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}

func banner(scheme, addr string) {
	fmt.Println("┌─────────────────────────────────────────────────────────────┐")
	fmt.Printf("│  Scraper UI ready.  Open:  %s://%-28s │\n", scheme, addr)
	fmt.Println("└─────────────────────────────────────────────────────────────┘")
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, indexHTML)
}

func handleScrape(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		URLs []string `json:"urls"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad JSON", http.StatusBadRequest)
		return
	}

	var urls []string
	for _, u := range req.URLs {
		u = strings.TrimSpace(u)
		if u == "" {
			continue
		}
		if !strings.HasPrefix(u, "http://") && !strings.HasPrefix(u, "https://") {
			u = "https://" + u
		}
		urls = append(urls, u)
	}

	results := scraper.ScrapeAll(r.Context(), urls)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// selfSignedCert builds an in-memory TLS cert valid for localhost. Nothing is
// written to disk; it's regenerated each startup.
func selfSignedCert() (tls.Certificate, error) {
	priv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return tls.Certificate{}, err
	}
	serial, err := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 128))
	if err != nil {
		return tls.Certificate{}, err
	}
	tmpl := x509.Certificate{
		SerialNumber: serial,
		Subject:      pkix.Name{Organization: []string{"concurrent-web-scraper (local)"}},
		NotBefore:    time.Now().Add(-time.Hour),
		NotAfter:     time.Now().Add(365 * 24 * time.Hour),
		KeyUsage:     x509.KeyUsageDigitalSignature | x509.KeyUsageKeyEncipherment,
		ExtKeyUsage:  []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		DNSNames:     []string{"localhost"},
		IPAddresses:  []net.IP{net.IPv4(127, 0, 0, 1), net.IPv6loopback},
	}
	der, err := x509.CreateCertificate(rand.Reader, &tmpl, &tmpl, &priv.PublicKey, priv)
	if err != nil {
		return tls.Certificate{}, err
	}
	keyDER, err := x509.MarshalECPrivateKey(priv)
	if err != nil {
		return tls.Certificate{}, err
	}
	certPEM := pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: der})
	keyPEM := pem.EncodeToMemory(&pem.Block{Type: "EC PRIVATE KEY", Bytes: keyDER})
	return tls.X509KeyPair(certPEM, keyPEM)
}

// tlsNoiseFilter drops the cosmetic "unknown certificate" handshake lines the
// browser emits before the user accepts a self-signed cert. Real errors pass.
type tlsNoiseFilter struct{}

func (tlsNoiseFilter) Write(p []byte) (int, error) {
	msg := string(p)
	if strings.Contains(msg, "TLS handshake error") &&
		(strings.Contains(msg, "unknown certificate") ||
			strings.Contains(msg, "certificate unknown") ||
			strings.Contains(msg, "bad certificate") ||
			strings.Contains(msg, "EOF")) {
		return len(p), nil
	}
	return os.Stderr.Write(p)
}
