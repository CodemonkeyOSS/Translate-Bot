# translate-bot
![Node.js CI](https://github.com/CodemonkeyOSS/interpret-bot/workflows/Node.js%20CI/badge.svg)
[![Patreon](https://img.shields.io/badge/patreon-donate-orange.svg)](https://www.patreon.com/codemonkeyoss)
[![License](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](LICENSE)


## Shameless Plug
This bot was written to support the awesome activities going on in the Project Owl Discord. If you want to see this thing in action, and have an interest in learning more and/or discussing geopolitical events around the globe, come join us! https://discord.gg/projectowl

## Overview
This project is a Discord bot that listens to a discord server for messages containing links, and responds to them with translated links in english with a formatted embedded message.

## Configuration

### To run it

Run `npm install` from the project root to get all the node_modules you need

The bot will rely on a few environment variables being available to work properly

| Item | environment variable? | Notes |
| --- | --- | --- |
| Discord Bot API Token | DISCORD_TRANSLATE_TOKEN | https://www.writebots.com/discord-bot-token/ |
| Google Cloud Project ID | GOOGLE_PROJECT_ID | --- |
| Google Cloud Client Email | GOOGLE_CLIENT_EMAIL | --- |
| Google Cloud Client Key | GOOGLE_CLIENT_KEY | --- |
| Twitter Consumer Key | TWITTER_CONSUMER_KEY | --- |
| Twitter Secret Key | TWITTER_SECRET_KEY | --- |
| Twitter Bearer Token | TWITTER_BEARER_TOKEN | --- |
| DetectLanguage API Key | DL_KEY | https://detectlanguage.com/ | 

The bot can be run with 
`DISCORD_TRANSLATE_TOKEN=$DISCORD_TRANSLATE_TOKEN DL_KEY=$DL_KEY GOOGLE_PROJECT_ID=$GOOGLE_PROJECT_ID GOOGLE_CLIENT_EMAIL=$GOOGLE_CLIENT_EMAIL GOOGLE_CLIENT_KEY=$GOOGLE_CLIENT_KEY GOOGLE_TRANSLATE_KEY=$GOOGLE_TRANSLATE_KEY TWITTER_BEARER_TOKEN=$TWITTER_BEARER_TOKEN TWITTER_CONSUMER_KEY=$TWITTER_CONSUMER_KEY TWITTER_SECRET_KEY=$TWITTER_SECRET_KEY node src/app.js`

### Configuration values
All configurations for the bot are kept in src/config/config.json (except the log format). There is an example-config.json you can copy to get started, but tune parameters as needed for logging and such.

#### logger
level = ["trace", "debug", "info", "warn", "error"]

file = (Add a string filepath here for the log file, default is src/log/translate-bot.log)

## Credits
Most of this work is an extension of code that Relic of ProjectOwl had written, and was cleaned up for easier development and use.
Big thanks to DetectLanguage.com for their awesome, cost-efficient API for running detections.
