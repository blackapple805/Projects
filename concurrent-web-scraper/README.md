# Concurrent Web Scraper

This project is a concurrent web scraper written in Go. It fetches data from multiple websites in parallel and stores the results in a file.

## Features

- Reads URLs from a file
- Fetches data from URLs concurrently using goroutines
- Stores the fetched data in a results file

## Prerequisites

- Go 1.16 or later

## Usage

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/concurrent-web-scraper.git
    cd concurrent-web-scraper
    ```

2. Add URLs to the `urls.txt` file.

3. Build and run the program:

    ```bash
    go build -o scraper
    ./scraper
    ```

4. Check the `results.txt` file for the scraped data.# Concurrent Web Scraper

This project is a concurrent web scraper written in Go. It fetches data from multiple websites in parallel and stores the results in a file.

## Features

- Reads URLs from a file
- Fetches data from URLs concurrently using goroutines
- Stores the fetched data in a results file

## Prerequisites

- Go 1.16 or later

## Usage

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/concurrent-web-scraper.git
    cd concurrent-web-scraper
    ```

2. Add URLs to the `urls.txt` file.

3. Build and run the program:

    ```bash
    go build -o scraper
    ./scraper
    ```

4. Check the `results.txt` file for the scraped data.