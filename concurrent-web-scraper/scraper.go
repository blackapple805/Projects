package main

import (
	"bufio"
	"fmt"
	"golang.org/x/net/html"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
)

// readLines reads a file and returns a slice of lines
func readLines(path string) ([]string, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var lines []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	return lines, scanner.Err()
}

// fetch retrieves the content of a URL and extracts relevant data
func fetch(url string) (string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	title, paragraph := extractData(string(body))

	return fmt.Sprintf("URL: %s\nTitle: %s\nFirst Paragraph: %s\n", url, title, paragraph), nil
}

// extractData parses the HTML and extracts the title and first paragraph
func extractData(body string) (string, string) {
	doc, err := html.Parse(strings.NewReader(body))
	if err != nil {
		return "N/A", "N/A"
	}

	var title, paragraph string
	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "title" && n.FirstChild != nil {
			title = n.FirstChild.Data
		}
		if n.Type == html.ElementNode && n.Data == "p" && paragraph == "" && n.FirstChild != nil {
			paragraph = n.FirstChild.Data
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			f(c)
		}
	}
	f(doc)

	return title, paragraph
}
