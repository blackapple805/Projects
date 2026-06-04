package scrape

import (
	"fmt"
	"net"
	"net/url"
	"strings"
	"syscall"
	"time"
)

// safeControl is installed as the http.Transport's DialContext control hook.
// It runs after DNS resolution, just before the socket connects, and rejects
// any address that resolves to a private, loopback, or otherwise non-public
// IP. Checking at dial time (not just parse time) also defeats DNS-rebinding,
// where a hostname resolves to a public IP on first lookup and a private one
// on the connect.
func safeControl(_, address string, _ syscall.RawConn) error {
	host, _, err := net.SplitHostPort(address)
	if err != nil {
		return fmt.Errorf("invalid address %q: %w", address, err)
	}
	ip := net.ParseIP(host)
	if ip == nil {
		return fmt.Errorf("could not parse IP from %q", host)
	}
	if !isPublicIP(ip) {
		return fmt.Errorf("blocked non-public address %s (SSRF protection)", ip)
	}
	return nil
}

// isPublicIP reports whether an IP is a routable public address (i.e. not
// loopback, private, link-local, multicast, or otherwise special-use).
func isPublicIP(ip net.IP) bool {
	if ip.IsLoopback() || ip.IsPrivate() || ip.IsUnspecified() ||
		ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsMulticast() {
		return false
	}
	// Cloud metadata endpoint and CGNAT range aren't all covered by IsPrivate.
	//
	// Note: IPv4-mapped IPv6 inputs (e.g. ::ffff:10.0.0.1) don't need a
	// separate CIDR here -- net.ParseIP normalizes them to plain IPv4, so the
	// checks above already catch a mapped private/loopback address.
	for _, cidr := range blockedCIDRs {
		if cidr.Contains(ip) {
			return false
		}
	}
	return true
}

var blockedCIDRs = mustCIDRs(
	"169.254.0.0/16", // link-local (AWS/GCP metadata 169.254.169.254)
	"100.64.0.0/10",  // carrier-grade NAT
	"fc00::/7",       // IPv6 unique local
	"fe80::/10",      // IPv6 link-local
)

func mustCIDRs(cidrs ...string) []*net.IPNet {
	out := make([]*net.IPNet, 0, len(cidrs))
	for _, c := range cidrs {
		_, n, err := net.ParseCIDR(c)
		if err != nil {
			panic("bad CIDR in safety list: " + c)
		}
		out = append(out, n)
	}
	return out
}

// validateURL does a cheap pre-flight check on the URL string before any
// network work: only http/https, and a hostname must be present. The dial-time
// safeControl hook does the authoritative IP check.
func validateURL(raw string) error {
	u, err := url.Parse(raw)
	if err != nil {
		return fmt.Errorf("invalid URL: %w", err)
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return fmt.Errorf("unsupported scheme %q (only http/https)", u.Scheme)
	}
	if strings.TrimSpace(u.Hostname()) == "" {
		return fmt.Errorf("missing host")
	}
	return nil
}

// RateLimiter is a simple token-bucket limiter: it allows up to `burst`
// immediate calls, then paces further calls to one per `interval`. Safe for
// concurrent use. Used to stop a public endpoint being hammered.
type RateLimiter struct {
	tokens chan struct{}
}

// NewRateLimiter creates a limiter with the given burst size and refill rate.
func NewRateLimiter(burst int, interval time.Duration) *RateLimiter {
	rl := &RateLimiter{tokens: make(chan struct{}, burst)}
	for i := 0; i < burst; i++ {
		rl.tokens <- struct{}{}
	}
	go func() {
		t := time.NewTicker(interval)
		defer t.Stop()
		for range t.C {
			select {
			case rl.tokens <- struct{}{}:
			default: // bucket full
			}
		}
	}()
	return rl
}

// Allow returns true if a token was available (non-blocking).
func (rl *RateLimiter) Allow() bool {
	select {
	case <-rl.tokens:
		return true
	default:
		return false
	}
}
