#!/usr/bin/env python3
"""
har_to_csv.py — turn browser HAR captures into one tidy CSV for ELK.

A HAR file is what you get from "Save all as HAR" in a browser's Network
tab (or from a proxy). Each HAR holds a list of HTTP requests/responses.
This flattens every request across every .har in a folder into a single
CSV with a clean, fully-populated schema — no dead columns, no hardcoded
paths.

Usage:
    python har_to_csv.py INPUT_DIR [-o OUTPUT.csv]

Example:
    python har_to_csv.py ./captures -o ./data/traffic.csv
"""

import argparse
import csv
import json
import os
import sys
from urllib.parse import urlparse

# The columns Logstash expects. Keep this in sync with logstash/logstash.conf.
COLUMNS = [
    "timestamp",      # ISO8601 -> parsed to @timestamp in Logstash
    "method",         # GET, POST, ...
    "url",            # full request URL
    "host",           # derived from url (always present)
    "scheme",         # http / https
    "path",           # url path, no query string
    "extension",      # file extension of the path, if any
    "status",         # HTTP status code (int)
    "status_text",    # "OK", "Found", ...
    "response_bytes", # response body size (int)
    "time_ms",        # total request time in ms (int)
    "mime_type",      # response content type
    "server_ip",      # responding server IP -> geoip in Logstash
    "referer",        # request Referer header
    "user_agent",     # request User-Agent header
]


def header_value(headers, name):
    """Case-insensitive lookup of a header value in a HAR header list."""
    name = name.lower()
    for h in headers or []:
        if h.get("name", "").lower() == name:
            return h.get("value")
    return None


def safe_int(value, default=0):
    try:
        n = int(value)
        return n if n >= 0 else default  # HAR uses -1 for "unknown"
    except (TypeError, ValueError):
        return default


def entry_to_row(entry):
    req = entry.get("request", {})
    res = entry.get("response", {})
    url = req.get("url", "")
    parsed = urlparse(url)
    path = parsed.path or ""
    ext = os.path.splitext(path)[1].lstrip(".").lower()

    return {
        "timestamp": entry.get("startedDateTime", ""),
        "method": req.get("method", ""),
        "url": url,
        "host": parsed.netloc,
        "scheme": parsed.scheme,
        "path": path,
        "extension": ext,
        "status": safe_int(res.get("status")),
        "status_text": res.get("statusText", ""),
        "response_bytes": safe_int(res.get("bodySize")),
        "time_ms": safe_int(entry.get("time")),
        "mime_type": (res.get("content", {}) or {}).get("mimeType", ""),
        "server_ip": entry.get("serverIPAddress", ""),
        "referer": header_value(req.get("headers"), "Referer") or "",
        "user_agent": header_value(req.get("headers"), "User-Agent") or "",
    }


def convert_file(har_path, writer):
    try:
        with open(har_path, "r", encoding="utf-8") as f:
            har = json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        print(f"  ! skipping {os.path.basename(har_path)}: {e}", file=sys.stderr)
        return 0

    entries = har.get("log", {}).get("entries", [])
    for entry in entries:
        writer.writerow(entry_to_row(entry))
    return len(entries)


def main():
    ap = argparse.ArgumentParser(description="Flatten HAR captures into one CSV.")
    ap.add_argument("input_dir", help="Folder containing .har files")
    ap.add_argument(
        "-o", "--output", default="data/traffic.csv", help="Output CSV path"
    )
    args = ap.parse_args()

    if not os.path.isdir(args.input_dir):
        sys.exit(f"Not a directory: {args.input_dir}")

    har_files = [
        os.path.join(args.input_dir, f)
        for f in sorted(os.listdir(args.input_dir))
        if f.lower().endswith(".har")
    ]
    if not har_files:
        sys.exit(f"No .har files found in {args.input_dir}")

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    total = 0
    with open(args.output, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        for har in har_files:
            n = convert_file(har, writer)
            total += n
            print(f"  + {os.path.basename(har)}: {n} requests")

    print(f"\nDone. Wrote {total} requests from {len(har_files)} file(s) to {args.output}")


if __name__ == "__main__":
    main()
