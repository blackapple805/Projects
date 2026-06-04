package scrape

import (
	"context"
	"strings"
	"testing"
	"time"
)

// Live integration tests hit real websites, so they're skipped by default
// (they need network and can be flaky). Run them explicitly with:
//
//	go test ./internal/scrape -run TestLive -v
//
// They auto-skip in -short mode (e.g. CI quick checks):
//
//	go test -short ./...
func TestLiveScrapingFriendlySites(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping live network test in -short mode")
	}

	cases := []struct {
		url         string
		wantDescIn  string // a substring expected in the description; empty = just expect non-N/A
		wantTitleIn string // a substring expected in the title; empty = skip
	}{
		{"https://example.com", "documentation", ""},
		{"https://books.toscrape.com", "", ""},
		{"https://quotes.toscrape.com", "", ""},
		// httpbin.org/html ships no <title>, so the title falls back to the
		// first <h1> ("Herman Melville - Moby-Dick"). "Melville" lives in the
		// title, not the body paragraph, so assert each against the right field.
		{"https://httpbin.org/html", "blacksmith", "Melville"},
	}

	s := New(WithTimeout(20 * time.Second))
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	for _, c := range cases {
		t.Run(c.url, func(t *testing.T) {
			r := s.Scrape(ctx, c.url)
			if r.Err != "" {
				t.Fatalf("scrape error: %s", r.Err)
			}
			if r.Status != 200 {
				t.Fatalf("status = %d, want 200", r.Status)
			}
			if r.Title == "N/A" || r.Title == "" {
				t.Errorf("got no title for %s", c.url)
			}
			if r.Description == "N/A" {
				t.Errorf("got N/A description for %s (source=%s)", c.url, r.Source)
			}
			if c.wantDescIn != "" && !strings.Contains(r.Description, c.wantDescIn) {
				t.Errorf("desc = %q, want substring %q", r.Description, c.wantDescIn)
			}
			if c.wantTitleIn != "" && !strings.Contains(r.Title, c.wantTitleIn) {
				t.Errorf("title = %q, want substring %q", r.Title, c.wantTitleIn)
			}
		})
	}
}
