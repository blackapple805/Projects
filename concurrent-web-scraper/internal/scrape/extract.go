package scrape

import (
	"encoding/json"
	"strconv"
	"strings"
	"unicode/utf8"

	"golang.org/x/net/html"
)

// pageData collects every candidate signal in a single pass over the tree.
type pageData struct {
	title, ogTitle, metaDesc, ogDesc, jsonLD string
	firstH1, firstHeading, firstListItem     string
	bestContent                              string // highest-scoring prose block seen
	bestContentScore                         int
	contentSeen                              int // count of usable prose blocks (gives lead/position)
}

// extract walks the HTML once, gathering candidates, then chooses the best
// description by SCORING every candidate rather than following a fixed
// priority order. This lets a strong lead paragraph beat a generic meta tag,
// while a weak/absent page body still falls back to the curated meta/og/JSON-LD
// summary -- "best case per page" instead of one rule for all sites.
//
// Scoring rewards:
//   - curated summaries (meta/og/json-ld) with a base head start
//   - EARLY paragraphs over later ones (captures the lead, not a mid-article block)
//   - a summary-sized length, over both stubs and sprawling walls of text
//   - sentence-like text over label fragments ("All products")
func extract(doc *html.Node) (title, desc, source string) {
	var d pageData
	chrome := 0 // >0 means we're inside boilerplate (header/nav/footer/aside/figure)

	var walk func(*html.Node)
	walk = func(n *html.Node) {
		enteredChrome := false
		if n.Type == html.ElementNode {
			switch n.Data {
			case "header", "nav", "footer", "aside", "figure":
				chrome++
				enteredChrome = true
			case "title":
				if d.title == "" {
					d.title = squeeze(textOf(n))
				}
			case "h1":
				if d.firstH1 == "" {
					d.firstH1 = squeeze(textOf(n))
				}
				fallthrough
			case "h2", "h3":
				if chrome == 0 && d.firstHeading == "" {
					if t := squeeze(textOf(n)); t != "" {
						d.firstHeading = t
					}
				}
			case "p", "blockquote":
				if chrome == 0 {
					considerContent(squeeze(textOf(n)), &d)
				}
			case "li":
				if chrome == 0 && d.firstListItem == "" {
					if t := squeeze(textOf(n)); len(t) > 20 {
						d.firstListItem = t
					}
				}
			case "span", "div":
				// Quote/snippet containers often use span/div with a "text"-ish
				// class. Only consider leaf-ish nodes to avoid grabbing whole
				// page wrappers, and skip site chrome.
				if chrome == 0 {
					cls := strings.ToLower(attr(n, "class"))
					if strings.Contains(cls, "text") || strings.Contains(cls, "quote") ||
						strings.Contains(cls, "summary") || strings.Contains(cls, "desc") {
						if isLeafText(n) {
							considerContent(squeeze(textOf(n)), &d)
						}
					}
				}
			case "meta":
				collectMeta(n, &d)
			case "script":
				if attr(n, "type") == "application/ld+json" && d.jsonLD == "" {
					d.jsonLD = jsonLDDesc(textOf(n))
				}
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
		if enteredChrome {
			chrome--
		}
	}
	walk(doc)

	// Title: <title>, then og:title, then the first <h1> (covers pages like
	// httpbin.org/html that ship no <title>).
	title = firstNonEmpty(d.title, d.ogTitle, d.firstH1, "N/A")

	// Pick the highest-scoring description across all candidate sources.
	bestText, bestSource, bestScore := "", "none", 0
	add := func(text, src string, sc int) {
		if text != "" && sc > bestScore {
			bestText, bestSource, bestScore = text, src, sc
		}
	}
	add(d.bestContent, "content", d.bestContentScore)
	if isUsableTag(d.metaDesc) {
		add(d.metaDesc, "meta-description", scoreSummary(66, d.metaDesc, -1))
	}
	if isUsableTag(d.ogDesc) {
		add(d.ogDesc, "open-graph", scoreSummary(62, d.ogDesc, -1))
	}
	if isUsableTag(d.jsonLD) {
		add(d.jsonLD, "json-ld", scoreSummary(60, d.jsonLD, -1))
	}
	if d.firstHeading != "" && d.firstHeading != title {
		add(d.firstHeading, "heading", 30)
	}
	if d.firstListItem != "" {
		add(d.firstListItem, "list-item", 25)
	}

	if bestText == "" {
		return title, "N/A", "none"
	}
	return title, bestText, bestSource
}

// considerContent scores a prose block and keeps the best one seen. Each usable
// block consumes a position slot, so the FIRST substantive paragraph scores as
// the lead (position 0); short stubs are skipped and don't push the lead back.
func considerContent(t string, d *pageData) {
	if !isUsableSummary(t) {
		return
	}
	order := d.contentSeen
	d.contentSeen++
	if sc := scoreSummary(60, t, order); sc > d.bestContentScore {
		d.bestContentScore = sc
		d.bestContent = t
	}
}

// scoreSummary rates a candidate description. base sets the source's head start;
// order >= 0 marks page prose and applies a strong lead-position bonus (-1 =
// curated tags, which have no document position).
func scoreSummary(base int, text string, order int) int {
	s := base + lengthBonus(text)
	if order >= 0 {
		// Strong preference for the lead: the first substantive paragraph is
		// almost always the best summary of a page. The bonus decays fast, so
		// a long mid-article block can't outweigh the actual opening.
		if b := 20 - order*8; b > 0 {
			s += b
		}
	}
	if endsSentence(text) {
		s += 5
	}
	return s
}

// lengthBonus gives a small, capped nudge for having enough text to be
// informative. It is deliberately capped so a sprawling paragraph is never
// "better" than a concise one just for being longer.
func lengthBonus(s string) int {
	if b := utf8.RuneCountInString(s) / 12; b < 12 {
		return b
	}
	return 12
}

// isUsableSummary gates PAGE PROSE: it rejects fragments, single tokens, and
// stray CSS so a stub paragraph never becomes a description.
func isUsableSummary(s string) bool {
	if utf8.RuneCountInString(s) < 40 || len(strings.Fields(s)) < 6 {
		return false
	}
	if strings.Contains(s, "{") && strings.Contains(s, "}") { // CSS that slipped through
		return false
	}
	return true
}

// isUsableTag gates CURATED summaries (meta/og/json-ld). These are authored to
// be descriptions, so the bar is much lower than for page prose -- just enough
// to skip empty/placeholder values and stray CSS.
func isUsableTag(s string) bool {
	if utf8.RuneCountInString(s) < 10 {
		return false
	}
	if strings.Contains(s, "{") && strings.Contains(s, "}") {
		return false
	}
	return true
}

func endsSentence(s string) bool {
	s = strings.TrimSpace(s)
	if s == "" {
		return false
	}
	r := []rune(s)
	switch r[len(r)-1] {
	case '.', '!', '?', '"', '\u201d', '\u2019', ')':
		return true
	}
	return false
}

// isLeafText reports whether a node contains text but no nested block elements
// -- i.e. it's a content leaf, not a layout wrapper. Prevents grabbing an
// entire page container as a "description".
func isLeafText(n *html.Node) bool {
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if c.Type == html.ElementNode {
			switch c.Data {
			case "div", "section", "article", "ul", "ol", "table", "nav", "header", "footer":
				return false
			}
		}
	}
	return true
}

func collectMeta(n *html.Node, d *pageData) {
	name := strings.ToLower(attr(n, "name"))
	prop := strings.ToLower(attr(n, "property"))
	content := squeeze(attr(n, "content"))
	if content == "" {
		return
	}
	switch {
	case name == "description" && d.metaDesc == "":
		d.metaDesc = content
	case prop == "og:description" && d.ogDesc == "":
		d.ogDesc = content
	case prop == "og:title" && d.ogTitle == "":
		d.ogTitle = content
	}
}

// jsonLDDesc pulls a "description" out of a JSON-LD blob, which may be a single
// object or an array. Malformed JSON is ignored rather than failing the scrape.
func jsonLDDesc(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return ""
	}
	var obj map[string]any
	if json.Unmarshal([]byte(raw), &obj) == nil {
		if s, ok := obj["description"].(string); ok {
			return squeeze(s)
		}
	}
	var arr []map[string]any
	if json.Unmarshal([]byte(raw), &arr) == nil {
		for _, item := range arr {
			if s, ok := item["description"].(string); ok && s != "" {
				return squeeze(s)
			}
		}
	}
	return ""
}

// blockNote explains, in human terms, when a response is a bot wall or
// challenge page rather than real content -- so the output says why it's empty.
func blockNote(status int, title string) string {
	t := strings.ToLower(title)
	switch {
	case status == 403 || status == 429:
		return "[blocked: HTTP " + strconv.Itoa(status) + " - site refused the scraper]"
	case strings.Contains(t, "just a moment"),
		strings.Contains(t, "attention required"),
		strings.Contains(t, "please wait"),
		strings.Contains(t, "verification"),
		strings.Contains(t, "are you a robot"),
		strings.Contains(t, "access denied"):
		return "[blocked: bot-challenge page served instead of content]"
	}
	return ""
}

func attr(n *html.Node, key string) string {
	for _, a := range n.Attr {
		if strings.EqualFold(a.Key, key) {
			return a.Val
		}
	}
	return ""
}

// textOf returns the concatenated text of a node's subtree, but never descends
// into non-content elements (style, script, noscript, template, svg). Those
// carry CSS/JS source -- e.g. Wikipedia inlines TemplateStyles <style> blocks
// inside article markup -- which must never be mistaken for page prose.
//
// The skip applies to *descendants* only: when textOf is called directly on a
// <script> (the JSON-LD path), its own text is still returned.
func textOf(n *html.Node) string {
	var sb strings.Builder
	var walk func(*html.Node, bool)
	walk = func(n *html.Node, root bool) {
		if n.Type == html.ElementNode && !root {
			switch n.Data {
			case "style", "script", "noscript", "template", "svg":
				return
			}
		}
		if n.Type == html.TextNode {
			sb.WriteString(n.Data)
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			walk(c, false)
		}
	}
	walk(n, true)
	return sb.String()
}

func squeeze(s string) string { return strings.Join(strings.Fields(s), " ") }

func firstNonEmpty(vals ...string) string {
	for _, v := range vals {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}
