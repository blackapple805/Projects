package main

import (
	"fmt"
	"log"
	"os"
	"sync"
	"time"
)

func main() {
	start := time.Now()

	// Read URLs from file
	urls, err := readLines("urls.txt")
	if err != nil {
		log.Fatalf("Failed to read URLs: %v", err)
	}

	// Create a channel to receive results
	results := make(chan string)

	// Wait group to wait for all goroutines to finish
	var wg sync.WaitGroup

	// Launch a goroutine for each URL
	for _, url := range urls {
		wg.Add(1)
		go func(url string) {
			defer wg.Done()
			result, err := fetch(url)
			if err != nil {
				log.Printf("Failed to fetch URL %s: %v", url, err)
				return
			}
			results <- result
		}(url)
	}

	// Close the results channel when all goroutines are done
	go func() {
		wg.Wait()
		close(results)
	}()

	// Write results to file
	file, err := os.Create("results.txt")
	if err != nil {
		log.Fatalf("Failed to create results file: %v", err)
	}
	defer file.Close()

	for result := range results {
		file.WriteString(result + "\n")
	}

	fmt.Printf("Scraping completed in %v\n", time.Since(start))
}
