// Command scraper reads URLs from a file, scrapes them concurrently, and
// writes the results to an output file.
//
//	go run ./cmd/scraper                          # urls.txt -> results.txt
//	go run ./cmd/scraper -in sites.txt -out x.txt # custom files
//	go run ./cmd/scraper -c 16 -timeout 20s       # tuning
package main

import (
	"bufio"
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"concurrent-web-scraper/internal/scrape"
)

func main() {
	in := flag.String("in", "urls.txt", "input file, one URL per line")
	out := flag.String("out", "results.txt", "output file")
	conc := flag.Int("c", 8, "max concurrent requests")
	timeout := flag.Duration("timeout", 15*time.Second, "per-request timeout")
	flag.Parse()

	urls, err := readLines(*in)
	if err != nil {
		log.Fatalf("reading %s: %v", *in, err)
	}
	if len(urls) == 0 {
		log.Fatalf("%s is empty", *in)
	}

	start := time.Now()
	s := scrape.New(scrape.WithConcurrency(*conc), scrape.WithTimeout(*timeout))
	results := s.ScrapeAll(context.Background(), urls)

	f, err := os.Create(*out)
	if err != nil {
		log.Fatalf("creating %s: %v", *out, err)
	}
	defer f.Close()
	for _, r := range results {
		fmt.Fprintln(f, r.String())
	}

	ok := 0
	for _, r := range results {
		if r.Err == "" && r.Source != "blocked" {
			ok++
		}
	}
	fmt.Printf("Scraped %d URLs (%d clean) in %v -> %s\n",
		len(results), ok, time.Since(start).Round(time.Millisecond), *out)
}

func readLines(path string) ([]string, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	var lines []string
	sc := bufio.NewScanner(f)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line != "" && !strings.HasPrefix(line, "#") { // allow # comments
			lines = append(lines, line)
		}
	}
	return lines, sc.Err()
}
