# My Portfolio - Login Screen

This project contains a simple login screen implemented with React, which is part of my personal portfolio website.

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

This project runs with Node.js and npm. If you don't have them installed, download and install them from [Node.js website](https://nodejs.org/).

### Installation

1. Clone the repository:
```bash
git clone https://github.com/blackapple805/my-portfolio.git

## Troubleshooting

### Node.js `digital envelope routines::unsupported` Error

If you encounter an error related to `digital envelope routines::unsupported` when starting the development server, it may be due to a version compatibility issue with Node.js and the OpenSSL library.

To resolve this error, you can set the `NODE_OPTIONS` environment variable to use the legacy provider before starting the server:

```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm start
