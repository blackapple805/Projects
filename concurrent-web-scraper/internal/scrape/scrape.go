// Package scrape contains the core web-scraping logic shared by every
// command in this module. Keeping it in one internal package means the CLI
// and the web server use identical behaviour -- no duplicated extraction code
// that can drift apart.
package scrape

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"

	"golang.org/x/net/html"
	"golang.org/x/net/html/charset"
)

// Result is the outcome of scraping a single URL. It always carries the URL
// it belongs to, so a result can never be matched to the wrong target.
type Result struct {
	URL         string `json:"url"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Source      string `json:"source"` // content | meta-description | open-graph | json-ld | heading | list-item | blocked | http-error | none
	Status      int    `json:"status"`
	Elapsed     string `json:"elapsed"`
	Err         string `json:"error,omitempty"`
}

// Scraper holds tunable configuration. Construct one with New and reuse it;
// the underlying http.Client pools connections across requests.
type Scraper struct {
	client      *http.Client
	concurrency int
	retries     int
	userAgent   string

	// Politeness: avoid hammering any single host so we don't trip rate limits
	// or bot defences. Requests to the same host are spaced at least hostDelay
	// apart (or the host's robots.txt Crawl-delay, whichever is larger), with
	// up to jitter of random extra delay to avoid a robotic timing pattern.
	hostDelay time.Duration
	jitter    time.Duration
	mu        sync.Mutex
	nextHost  map[string]time.Time

	// robots.txt support: fetched once per host and cached.
	useRobots bool
	robotsMu  sync.Mutex
	robots    map[string]*robotsEntry
}

type robotsEntry struct {
	disallow   []string
	allow      []string
	crawlDelay time.Duration
}

type robotsGroup struct {
	agents     []string
	disallow   []string
	allow      []string
	crawlDelay time.Duration
}

var allowAllRobots = &robotsEntry{}

func (r *robotsEntry) allowed(path string) bool {
	if len(r.disallow) == 0 && len(r.allow) == 0 {
		return true
	}

	longestAllow, longestDisallow := -1, -1
	for _, p := range r.allow {
		if matchRobotsPath(path, p) && len(p) > longestAllow {
			longestAllow = len(p)
		}
	}
	for _, p := range r.disallow {
		if matchRobotsPath(path, p) && len(p) > longestDisallow {
			longestDisallow = len(p)
		}
	}
	if longestAllow >= longestDisallow {
		return true
	}
	return longestDisallow < 0
}

func matchRobotsPath(path, pattern string) bool {
	if pattern == "" {
		return false
	}
	return strings.HasPrefix(path, pattern)
}

func (s *Scraper) robotsFor(ctx context.Context, scheme, host string) *robotsEntry {
	if !s.useRobots || host == "" {
		return allowAllRobots
	}
	key := scheme + "://" + host

	s.robotsMu.Lock()
	rules, ok := s.robots[key]
	s.robotsMu.Unlock()
	if ok {
		return rules
	}

	rules = s.fetchRobots(ctx, scheme, host)

	s.robotsMu.Lock()
	s.robots[key] = rules
	s.robotsMu.Unlock()
	return rules
}

func (s *Scraper) fetchRobots(ctx context.Context, scheme, host string) *robotsEntry {
	raw := scheme + "://" + host + "/robots.txt"
	resp, err := s.do(ctx, raw)
	if err != nil {
		return allowAllRobots
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return allowAllRobots
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 100*1024))
	if err != nil {
		return allowAllRobots
	}
	return parseRobotsTxt(string(body), s.userAgent)
}

func parseRobotsTxt(body, userAgent string) *robotsEntry {
	lines := strings.Split(strings.ReplaceAll(body, "\r\n", "\n"), "\n")
	var groups []robotsGroup
	var current robotsGroup
	for _, raw := range lines {
		line := raw
		if i := strings.IndexByte(line, '#'); i >= 0 {
			line = line[:i]
		}
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		parts := strings.SplitN(line, ":", 2)
		if len(parts) != 2 {
			continue
		}
		field := strings.ToLower(strings.TrimSpace(parts[0]))
		value := strings.TrimSpace(parts[1])

		switch field {
		case "user-agent":
			if len(current.agents) > 0 || len(current.disallow) > 0 || len(current.allow) > 0 || current.crawlDelay != 0 {
				groups = append(groups, current)
				current = robotsGroup{}
			}
			current.agents = append(current.agents, strings.ToLower(value))
		case "disallow":
			current.disallow = append(current.disallow, value)
		case "allow":
			current.allow = append(current.allow, value)
		case "crawl-delay":
			if secs, err := strconv.Atoi(value); err == nil && secs >= 0 {
				current.crawlDelay = time.Duration(secs) * time.Second
			}
		}
	}
	if len(current.agents) > 0 || len(current.disallow) > 0 || len(current.allow) > 0 || current.crawlDelay != 0 {
		groups = append(groups, current)
	}

	if len(groups) == 0 {
		return allowAllRobots
	}

	uaLower := strings.ToLower(userAgent)
	var selected *robotsGroup
	bestScore := -1
	for i := range groups {
		group := &groups[i]
		for _, agent := range group.agents {
			score := -1
			if agent == "*" {
				score = 0
			} else if strings.Contains(uaLower, agent) || strings.Contains(agent, uaLower) {
				score = len(agent)
			}
			if score > bestScore {
				bestScore = score
				selected = group
			}
		}
	}
	if selected == nil {
		return allowAllRobots
	}
	return &robotsEntry{
		disallow:   selected.disallow,
		allow:      selected.allow,
		crawlDelay: selected.crawlDelay,
	}
}

// Option configures a Scraper.
type Option func(*Scraper)

// WithConcurrency sets the maximum number of simultaneous requests.
func WithConcurrency(n int) Option {
	return func(s *Scraper) {
		if n > 0 {
			s.concurrency = n
		}
	}
}

// WithTimeout sets the per-request timeout.
func WithTimeout(d time.Duration) Option {
	return func(s *Scraper) { s.client.Timeout = d }
}

// WithRetries sets how many extra attempts a transient transport failure gets
// (0 = try once, no retry). Transient = EOF, connection reset, timeout.
func WithRetries(n int) Option {
	return func(s *Scraper) {
		if n >= 0 {
			s.retries = n
		}
	}
}

// WithUserAgent sets the User-Agent sent with every request. Prefer an honest
// string that identifies the tool and a contact, e.g.
//
//	WithUserAgent("acme-recon/1.0 (+https://acme.example/bot; ops@acme.example)")
//
// Some sites (Wikipedia among them) require a descriptive UA with contact info.
func WithUserAgent(ua string) Option {
	return func(s *Scraper) {
		if strings.TrimSpace(ua) != "" {
			s.userAgent = ua
		}
	}
}

// WithHostDelay sets the minimum spacing between requests to the SAME host.
// A robots.txt Crawl-delay larger than this still takes precedence. Set 0 to
// disable the floor (not recommended against real sites).
func WithHostDelay(d time.Duration) Option {
	return func(s *Scraper) {
		if d >= 0 {
			s.hostDelay = d
		}
	}
}

// WithRobots enables or disables robots.txt compliance (default: enabled).
func WithRobots(enabled bool) Option {
	return func(s *Scraper) { s.useRobots = enabled }
}

// New builds a Scraper with sensible, polite defaults, overridden by options.
func New(opts ...Option) *Scraper {
	s := &Scraper{
		concurrency: 8,
		retries:     2,
		hostDelay:   1 * time.Second,
		jitter:      250 * time.Millisecond,
		nextHost:    make(map[string]time.Time),
		useRobots:   true,
		robots:      make(map[string]*robotsEntry),
		// Honest default: identifies the tool rather than impersonating a
		// browser. Override with WithUserAgent to add your contact details.
		userAgent: "concurrent-web-scraper/1.0 (+https://github.com/example/concurrent-web-scraper; polite bot)",
	}
	s.client = &http.Client{
		Timeout:   15 * time.Second,
		Transport: newTransport(),
	}
	for _, opt := range opts {
		opt(s)
	}
	return s
}

// newTransport builds an HTTP/1.1 transport tuned for scraping.
//
// HTTP/2 is disabled deliberately (empty TLSNextProto). Some servers and CDNs
// -- httpbin.org's hosted instance among them -- reset the h2 stream when
// returning certain error statuses, which Go surfaces as a bare "EOF" before
// any status code is read. Forcing HTTP/1.1 makes those 4xx/5xx responses
// arrive intact so we can report the real status instead of a transport error.
//
// The dialer's Control hook enforces the SSRF guard (safeControl) at connect
// time, after DNS resolution -- which also defeats DNS-rebinding.
func newTransport() *http.Transport {
	dialer := &net.Dialer{
		Timeout:   10 * time.Second,
		KeepAlive: 30 * time.Second,
		Control:   safeControl,
	}
	return &http.Transport{
		DialContext:           dialer.DialContext,
		ForceAttemptHTTP2:     false,
		TLSNextProto:          map[string]func(string, *tls.Conn) http.RoundTripper{},
		MaxIdleConns:          100,
		MaxIdleConnsPerHost:   4,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
		ResponseHeaderTimeout: 15 * time.Second,
	}
}

// ScrapeAll fetches every URL concurrently (bounded by the configured
// concurrency) and returns results in the SAME ORDER as the input. Each
// worker writes into its own slice index, guaranteeing both ordering and
// correct URL association with no data race.
func (s *Scraper) ScrapeAll(ctx context.Context, urls []string) []Result {
	results := make([]Result, len(urls))
	sem := make(chan struct{}, s.concurrency)
	done := make(chan int, len(urls))

	for i, url := range urls {
		sem <- struct{}{}
		go func(i int, url string) {
			defer func() { <-sem; done <- i }()
			results[i] = s.Scrape(ctx, url)
		}(i, url)
	}
	for range urls {
		<-done
	}
	return results
}

// Scrape fetches one URL and extracts its title and best-available
// description. It never returns an out-of-band error: failures are recorded
// in Result.Err so callers always get a URL-tagged result. It checks robots.txt
// first, paces requests per host, retries transient transport failures, and
// honours Retry-After.
func (s *Scraper) Scrape(ctx context.Context, rawURL string) Result {
	start := time.Now()
	res := Result{URL: rawURL}
	defer func() { res.Elapsed = time.Since(start).Round(time.Millisecond).String() }()

	scheme, host, path := splitTarget(rawURL)

	// robots.txt: skip anything the host disallows for our agent, and let a
	// Crawl-delay raise the per-host spacing.
	delay := s.hostDelay
	if host != "" {
		rules := s.robotsFor(ctx, scheme, host)
		if !rules.allowed(path) {
			res.Source = "blocked"
			res.Description = "[skipped: disallowed by robots.txt]"
			return res
		}
		if rules.crawlDelay > delay {
			delay = rules.crawlDelay
		}
	}

	// Be polite: wait our turn for this host before opening a connection.
	if err := s.throttleHost(ctx, host, delay); err != nil {
		res.Err = friendlyErr(err)
		return res
	}

	resp, err := s.fetch(ctx, rawURL)
	if err != nil {
		res.Err = friendlyErr(err)
		return res
	}

	// Respect an explicit "slow down": on 429/503 with a sane Retry-After,
	// wait once and try again rather than pushing through.
	if resp.StatusCode == http.StatusTooManyRequests || resp.StatusCode == http.StatusServiceUnavailable {
		if d, ok := retryAfter(resp); ok && d > 0 && d <= 30*time.Second {
			resp.Body.Close()
			select {
			case <-ctx.Done():
				res.Err = friendlyErr(ctx.Err())
				return res
			case <-time.After(d):
			}
			if resp, err = s.fetch(ctx, rawURL); err != nil {
				res.Err = friendlyErr(err)
				return res
			}
		}
	}
	defer resp.Body.Close()
	res.Status = resp.StatusCode

	utf8Reader, err := charset.NewReader(resp.Body, resp.Header.Get("Content-Type"))
	if err != nil {
		res.Err = friendlyErr(err)
		return res
	}
	doc, err := html.Parse(utf8Reader)
	if err != nil {
		res.Err = friendlyErr(err)
		return res
	}

	res.Title, res.Description, res.Source = extract(doc)
	annotateStatus(&res)
	return res
}

// throttleHost blocks until it is polite to contact host again, then reserves
// the next slot. Per-host spacing plus a little jitter keeps us from hammering
// any one server or producing a robotic, evenly-timed pattern.
func (s *Scraper) throttleHost(ctx context.Context, host string, delay time.Duration) error {
	if host == "" || (delay <= 0 && s.jitter <= 0) {
		return nil
	}
	s.mu.Lock()
	now := time.Now()
	earliest := s.nextHost[host]
	if earliest.Before(now) {
		earliest = now
	}
	wait := earliest.Sub(now)
	if delay > 0 {
		s.nextHost[host] = earliest.Add(delay) // reserve the next slot
	}
	s.mu.Unlock()

	if s.jitter > 0 {
		wait += time.Duration(rand.Int63n(int64(s.jitter) + 1))
	}
	if wait <= 0 {
		return nil
	}
	timer := time.NewTimer(wait)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-timer.C:
		return nil
	}
}

// fetch performs the request, retrying transient transport failures. Non-2xx
// HTTP responses are NOT errors here -- they come back as a *http.Response so
// the caller can read the real status and any body.
func (s *Scraper) fetch(ctx context.Context, url string) (*http.Response, error) {
	attempts := s.retries + 1
	var resp *http.Response
	var err error

	for attempt := 1; attempt <= attempts; attempt++ {
		resp, err = s.do(ctx, url)
		if err == nil {
			return resp, nil
		}
		if ctx.Err() != nil || !isTransient(err) || attempt == attempts {
			return nil, err
		}
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(time.Duration(attempt) * 250 * time.Millisecond):
		}
	}
	return nil, err
}

func (s *Scraper) do(ctx context.Context, url string) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", s.userAgent)
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	return s.client.Do(req)
}

// retryAfter parses a Retry-After header, which may be either a number of
// seconds or an HTTP date.
func retryAfter(resp *http.Response) (time.Duration, bool) {
	v := strings.TrimSpace(resp.Header.Get("Retry-After"))
	if v == "" {
		return 0, false
	}
	if secs, err := strconv.Atoi(v); err == nil {
		if secs < 0 {
			secs = 0
		}
		return time.Duration(secs) * time.Second, true
	}
	if t, err := http.ParseTime(v); err == nil {
		if d := time.Until(t); d > 0 {
			return d, true
		}
		return 0, true
	}
	return 0, false
}

// annotateStatus turns an empty-bodied non-2xx response into a description that
// explains itself, rather than leaving a bare "N/A".
func annotateStatus(res *Result) {
	if note := blockNote(res.Status, res.Title); note != "" {
		res.Source = "blocked"
		if res.Description == "N/A" {
			res.Description = note
		}
		return
	}
	if res.Status >= 400 && res.Description == "N/A" {
		res.Description = fmt.Sprintf("[HTTP %d - %s]", res.Status, http.StatusText(res.Status))
		if res.Source == "none" {
			res.Source = "http-error"
		}
	}
}

// isTransient reports whether an error is worth retrying: connection drops,
// resets, and timeouts usually succeed on a second attempt.
func isTransient(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, io.EOF) || errors.Is(err, io.ErrUnexpectedEOF) {
		return true
	}
	var ne net.Error
	if errors.As(err, &ne) && ne.Timeout() {
		return true
	}
	msg := strings.ToLower(err.Error())
	for _, frag := range []string{
		"eof", "unexpected eof", "connection reset", "reset by peer",
		"broken pipe", "timeout", "server closed", "connection aborted",
	} {
		if strings.Contains(msg, frag) {
			return true
		}
	}
	return false
}

// friendlyErr rewrites the noisier transport errors into something a human can
// act on, while leaving already-clear messages (e.g. the SSRF block) intact.
func friendlyErr(err error) string {
	msg := err.Error()
	low := strings.ToLower(msg)
	switch {
	case strings.Contains(low, "ssrf"):
		return msg
	case strings.Contains(low, "no such host"):
		return "DNS lookup failed (no such host)"
	case strings.Contains(low, "timeout") || strings.Contains(low, "deadline exceeded"):
		return "request timed out"
	case strings.Contains(low, "connection refused"):
		return "connection refused by server"
	case strings.Contains(low, "eof"):
		return "server closed the connection before responding (EOF) - likely rate-limited or dropped, even after retries"
	default:
		return msg
	}
}

// splitTarget extracts the scheme, lowercased host, and path (with query) used
// for robots matching and per-host pacing.
func splitTarget(raw string) (scheme, host, path string) {
	u, err := url.Parse(raw)
	if err != nil || u.Host == "" {
		return "https", "", "/"
	}
	path = u.EscapedPath()
	if path == "" {
		path = "/"
	}
	if u.RawQuery != "" {
		path += "?" + u.RawQuery
	}
	scheme = u.Scheme
	if scheme == "" {
		scheme = "https"
	}
	return scheme, strings.ToLower(u.Host), path
}

// String renders a Result for plain-text file output.
func (r Result) String() string {
	if r.Err != "" {
		return fmt.Sprintf("URL: %s\nError: %s\n", r.URL, r.Err)
	}
	return fmt.Sprintf("URL: %s\nStatus: %d\nTitle: %s\nDescription: %s\nSource: %s\n",
		r.URL, r.Status, r.Title, r.Description, r.Source)
}
