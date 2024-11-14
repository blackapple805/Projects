# test_nltk.py
import nltk

nltk.download('punkt')

from nltk.tokenize import sent_tokenize

sample_text = "Hello again. I'm now going to be trying to demonstrate how to do a database migration from my school, my SQL, my manager, or management to Oracle. We're going to have to download and use Oracle SQL, developer to get that running. I'll try to see if I can get it to work right now in recording. I've already done it, but I'll show you. So you're going to want to log in into your database by using name and you want to create again your migration database and can see. It's already connected, it's done. That's good. So next, if you haven't already, or don't know about this, Oracle does use this, like, as a way to kind of keep track of databases all over, like, my SQL, MS, MS admin, MS, and MS net bait."

sentences = sent_tokenize(sample_text)

for sentence in sentences:
    print(sentence)
