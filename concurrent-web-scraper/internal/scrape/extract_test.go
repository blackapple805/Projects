package scrape

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"golang.org/x/net/html"
)

func parse(t *testing.T, s string) *html.Node {
	t.Helper()
	doc, err := html.Parse(strings.NewReader(s))
	if err != nil {
		t.Fatalf("parse: %v", err)
	}
	return doc
}

func TestExtractCascade(t *testing.T) {
	cases := []struct {
		name       string
		html       string
		wantSource string
		wantDescIn string
	}{
		{
			name:       "real prose wins",
			html:       `<title>Doc</title><body><p>This is the real first paragraph with enough text.</p></body>`,
			wantSource: "content",
			wantDescIn: "real first paragraph",
		},
		{
			name:       "meta description fallback",
			html:       `<head><title>Google</title><meta name="description" content="Search the world's information."></head><body><div>x</div></body>`,
			wantSource: "meta-description",
			wantDescIn: "Search the world",
		},
		{
			name:       "open graph fallback",
			html:       `<head><title>Site</title><meta property="og:description" content="A social card summary."></head>`,
			wantSource: "open-graph",
			wantDescIn: "social card",
		},
		{
			name:       "json-ld fallback",
			html:       `<head><title>Article</title><script type="application/ld+json">{"description":"Structured data summary."}</script></head>`,
			wantSource: "json-ld",
			wantDescIn: "Structured data",
		},
		{
			name:       "nothing available",
			html:       `<head><title>Empty</title></head><body><table><tr><td>x</td></tr></table></body>`,
			wantSource: "none",
			wantDescIn: "N/A",
		},
		{
			name:       "heading fallback for listing pages",
			html:       `<head><title>All products | Books</title></head><body><h1>All products</h1><div>book grid</div></body>`,
			wantSource: "heading",
			wantDescIn: "All products",
		},
		{
			name:       "list-item fallback",
			html:       `<head><title>List</title></head><body><ul><li>A detailed list item with enough text to qualify.</li></ul></body>`,
			wantSource: "list-item",
			wantDescIn: "detailed list item",
		},
		{
			name:       "short p is skipped for meta",
			html:       `<head><title>T</title><meta name="description" content="Long enough meta description here."></head><body><p>too short</p></body>`,
			wantSource: "meta-description",
			wantDescIn: "Long enough",
		},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			_, desc, source := extract(parse(t, c.html))
			if source != c.wantSource {
				t.Errorf("source = %q, want %q", source, c.wantSource)
			}
			if !strings.Contains(desc, c.wantDescIn) {
				t.Errorf("desc = %q, want substring %q", desc, c.wantDescIn)
			}
		})
	}
}

// TestLongestProseWins is the core fix for quotes.toscrape: the first <p> on
// the page is a short footer credit, but the actual quote (longer) should win.
func TestLongestProseWins(t *testing.T) {
	doc := parse(t, `<body>
		<div class="quote"><span class="text">"The world as we have created it is a process of our thinking. It cannot be changed without changing our thinking."</span></div>
		<footer><p>Quotes by: GoodReads.com</p></footer>
	</body>`)
	_, desc, source := extract(doc)
	if source != "content" {
		t.Fatalf("source = %q, want content", source)
	}
	if !strings.Contains(desc, "process of our thinking") {
		t.Errorf("expected the quote, got: %q", desc)
	}
	if strings.Contains(desc, "GoodReads") {
		t.Errorf("footer credit should not win over the quote: %q", desc)
	}
}

func TestProseFromNestedTags(t *testing.T) {
	// Regression: a <p> starting with an inline tag used to be dropped.
	doc := parse(t, `<body><p><a href="x">Link</a> then the rest of the sentence here.</p></body>`)
	_, desc, source := extract(doc)
	if source != "content" {
		t.Fatalf("source = %q, want content", source)
	}
	if !strings.Contains(desc, "rest of the sentence") {
		t.Errorf("nested text not captured: %q", desc)
	}
}

func TestBlockNote(t *testing.T) {
	if blockNote(403, "Anything") == "" {
		t.Error("403 should be flagged as blocked")
	}
	if blockNote(200, "Just a moment...") == "" {
		t.Error("Cloudflare title should be flagged")
	}
	if blockNote(200, "Hacker News") != "" {
		t.Error("a normal 200 page must not be flagged")
	}
}

func TestTitleFallsBackToOG(t *testing.T) {
	doc := parse(t, `<head><meta property="og:title" content="OG Title Here"></head>`)
	title, _, _ := extract(doc)
	if title != "OG Title Here" {
		t.Errorf("title = %q, want OG fallback", title)
	}
}

func TestTitleFallsBackToH1(t *testing.T) {
	doc := parse(t, `<body><h1>Herman Melville - Moby-Dick</h1><p>Call me Ishmael and so on with plenty of words.</p></body>`)
	title, _, _ := extract(doc)
	if title != "Herman Melville - Moby-Dick" {
		t.Errorf("title = %q, want h1 fallback", title)
	}
}

// TestFixtures runs extraction against saved HTML files in testdata/, mirroring
// the real structure of the sites we scrape. These are offline and fast.
func TestFixtures(t *testing.T) {
	cases := []struct {
		file       string
		wantTitle  string
		wantDescIn string
	}{
		{"books.html", "All products | Books to Scrape - Sandbox", "All products"},
		{"quotes.html", "Quotes to Scrape", "process of our thinking"},
	}
	for _, c := range cases {
		t.Run(c.file, func(t *testing.T) {
			data, err := os.ReadFile(filepath.Join("testdata", c.file))
			if err != nil {
				t.Skipf("fixture missing: %v", err)
			}
			doc, err := html.Parse(strings.NewReader(string(data)))
			if err != nil {
				t.Fatalf("parse: %v", err)
			}
			title, desc, _ := extract(doc)
			if title != c.wantTitle {
				t.Errorf("title = %q, want %q", title, c.wantTitle)
			}
			if !strings.Contains(desc, c.wantDescIn) {
				t.Errorf("desc = %q, want substring %q", desc, c.wantDescIn)
			}
		})
	}
}
