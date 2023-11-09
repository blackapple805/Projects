#!/bin/sh
##use this to test out on wireshark
##nc -l -u -p 9001 -e ./send_words.sh -k
###echo "pleaseee" | nc -u 127.0.0.1 9001
head -n 10 /usr/share/dict/words

