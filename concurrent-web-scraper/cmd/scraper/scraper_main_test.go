package main

import (
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

// TestReadLines checks that readLines trims whitespace, drops blank lines, and
// ignores '#' comments while preserving input order.
func TestReadLines(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "urls.txt")
	content := "# a comment\n" +
		"https://example.com\n" +
		"\n" +
		"   https://books.toscrape.com   \n" +
		"# another comment\n" +
		"https://quotes.toscrape.com\n"
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}

	got, err := readLines(path)
	if err != nil {
		t.Fatalf("readLines: %v", err)
	}
	want := []string{
		"https://example.com",
		"https://books.toscrape.com",
		"https://quotes.toscrape.com",
	}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("readLines = %#v, want %#v", got, want)
	}
}

// TestReadLinesMissingFile checks that a missing input file is reported as an
// error rather than silently returning an empty slice.
func TestReadLinesMissingFile(t *testing.T) {
	if _, err := readLines(filepath.Join(t.TempDir(), "nope.txt")); err == nil {
		t.Error("expected error for missing file, got nil")
	}
}
