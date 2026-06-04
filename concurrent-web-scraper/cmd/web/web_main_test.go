package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestFileExists covers the three outcomes: real file (true), missing path
// (false), and a directory (false -- it must not be treated as a cert file).
func TestFileExists(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "localhost.pem")
	if err := os.WriteFile(f, []byte("cert"), 0o644); err != nil {
		t.Fatal(err)
	}
	if !fileExists(f) {
		t.Error("fileExists(existing file) = false, want true")
	}
	if fileExists(filepath.Join(dir, "missing.pem")) {
		t.Error("fileExists(missing) = true, want false")
	}
	if fileExists(dir) {
		t.Error("fileExists(directory) = true, want false")
	}
}

// TestHandleIndex checks the index handler serves HTML with a 200.
func TestHandleIndex(t *testing.T) {
	rec := httptest.NewRecorder()
	handleIndex(rec, httptest.NewRequest(http.MethodGet, "/", nil))

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	if ct := rec.Header().Get("Content-Type"); !strings.HasPrefix(ct, "text/html") {
		t.Errorf("Content-Type = %q, want text/html", ct)
	}
	if rec.Body.Len() == 0 {
		t.Error("index body is empty")
	}
}

// TestHandleScrapeRejectsNonPost exercises the method guard without any network
// work (it returns before scraping).
func TestHandleScrapeRejectsNonPost(t *testing.T) {
	rec := httptest.NewRecorder()
	handleScrape(rec, httptest.NewRequest(http.MethodGet, "/scrape", nil))

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("status = %d, want 405", rec.Code)
	}
}

// TestHandleScrapeRejectsBadJSON exercises the decode-error path, again without
// touching the network.
func TestHandleScrapeRejectsBadJSON(t *testing.T) {
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/scrape", strings.NewReader("{not valid json"))
	handleScrape(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want 400", rec.Code)
	}
}

// TestSelfSignedCert checks the in-memory cert is generated and usable.
func TestSelfSignedCert(t *testing.T) {
	cert, err := selfSignedCert()
	if err != nil {
		t.Fatalf("selfSignedCert: %v", err)
	}
	if len(cert.Certificate) == 0 {
		t.Error("certificate chain is empty")
	}
	if cert.PrivateKey == nil {
		t.Error("private key is nil")
	}
}

// TestTLSNoiseFilter checks that a cosmetic self-signed handshake line is
// swallowed (reported as written but not forwarded to stderr).
func TestTLSNoiseFilter(t *testing.T) {
	noise := []byte("TLS handshake error from 127.0.0.1:52000: remote error: tls: unknown certificate")
	n, err := tlsNoiseFilter{}.Write(noise)
	if err != nil {
		t.Fatalf("Write returned error: %v", err)
	}
	if n != len(noise) {
		t.Errorf("Write returned n = %d, want %d", n, len(noise))
	}
}
