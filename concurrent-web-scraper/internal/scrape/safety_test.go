package scrape

import (
	"net"
	"testing"
	"time"
)

func TestIsPublicIP(t *testing.T) {
	cases := []struct {
		ip     string
		public bool
	}{
		{"8.8.8.8", true},            // Google DNS - public
		{"1.1.1.1", true},            // Cloudflare - public
		{"127.0.0.1", false},         // loopback
		{"10.0.0.1", false},          // private
		{"192.168.1.1", false},       // private
		{"172.16.5.4", false},        // private
		{"169.254.169.254", false},   // cloud metadata
		{"100.64.0.1", false},        // CGNAT
		{"::1", false},               // IPv6 loopback
		{"fe80::1", false},           // IPv6 link-local
		{"fc00::1", false},           // IPv6 unique-local
		{"0.0.0.0", false},           // unspecified
	}
	for _, c := range cases {
		ip := net.ParseIP(c.ip)
		if ip == nil {
			t.Fatalf("bad test IP %q", c.ip)
		}
		if got := isPublicIP(ip); got != c.public {
			t.Errorf("isPublicIP(%s) = %v, want %v", c.ip, got, c.public)
		}
	}
}

func TestValidateURL(t *testing.T) {
	good := []string{"https://example.com", "http://example.com/path"}
	for _, u := range good {
		if err := validateURL(u); err != nil {
			t.Errorf("validateURL(%q) unexpected error: %v", u, err)
		}
	}
	bad := []string{"ftp://example.com", "file:///etc/passwd", "javascript:alert(1)", "https://", "notaurl"}
	for _, u := range bad {
		if err := validateURL(u); err == nil {
			t.Errorf("validateURL(%q) should have errored", u)
		}
	}
}

func TestRateLimiter(t *testing.T) {
	rl := NewRateLimiter(2, time.Hour) // 2 tokens, effectively no refill in test
	if !rl.Allow() {
		t.Error("first call should be allowed")
	}
	if !rl.Allow() {
		t.Error("second call should be allowed")
	}
	if rl.Allow() {
		t.Error("third call should be denied (burst exhausted)")
	}
}
