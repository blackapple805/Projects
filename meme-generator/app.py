#!/bin/python

from flask import Flask, render_template
import requests
import json
import random

app = Flask(__name__)

def get_meme():
    url = "https://api.imgflip.com/get_memes"
    try:
        response = requests.get(url).json()
        if response["success"]:
            memes = response['data']["memes"]
            chosen_meme = random.choice(memes)
            meme_url = chosen_meme["url"]
            subreddit = chosen_meme["name"]
            return meme_url, subreddit
        else:
            return "Error fetching meme", "Unknown subreddit"
    except Exception as e:
        return str(e), "Unknown subreddit"

@app.route("/")
def index():
    meme_pic, subreddit = get_meme()
    return render_template("index.html", meme_pic=meme_pic, subreddit=subreddit)

app.run(host="0.0.0.0", port=5000)