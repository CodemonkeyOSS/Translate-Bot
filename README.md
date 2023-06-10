# translate-bot
![Node.js CI](https://github.com/CodemonkeyOSS/interpret-bot/workflows/Node.js%20CI/badge.svg)
[![CodeQL](https://github.com/CodemonkeyOSS/Translate-Bot/actions/workflows/codeql.yml/badge.svg)](https://github.com/CodemonkeyOSS/Translate-Bot/actions/workflows/codeql.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/codemonkeyoss/Translate-Bot/badge.svg?targetFile=package.json)](https://snyk.io/test/github/CodeMonkeyOSS/Translate-Bot?targetFile=package.json)
[![Patreon](https://img.shields.io/badge/patreon-donate-orange.svg)](https://www.patreon.com/codemonkeyoss)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## Shameless Plug
This bot was written to support the awesome activities going on in the Project Owl Discord. If you want to see this thing in action, and have an interest in learning more and/or discussing geopolitical events around the globe, come join us! https://discord.gg/projectowl

# Important Note

Unfortunately, due to Twitter's API pricing changes in 2023, I am unable to continue to pay (both financially and morally) for twitter's API access. For this reason, I have commented out the codepath that called the Twitter API, and regrettably have diverted twitter handling to the embed processor at this time. Folks are welcome to fork and uncomment the code, but I will not be using it going forward.

GG BOIS.

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
| Google Cloud Client Key | GOOGLE_CLIENT_KEY | --- |
| DetectLanguage API Key | DL_KEY | https://detectlanguage.com/ | 

The bot can be run with 
`DISCORD_TRANSLATE_TOKEN=$DISCORD_TRANSLATE_TOKEN DL_KEY=$DL_KEY GOOGLE_PROJECT_ID=$GOOGLE_PROJECT_ID GOOGLE_CLIENT_KEY=$GOOGLE_CLIENT_KEY node src/app.js`

### Configuration values
All configurations for the bot are kept in src/config/config.json (except the log format). There is an example-config.json you can copy to get started, but tune parameters as needed for logging and such.

#### logger
level = ["trace", "debug", "info", "warn", "error"]

file = (Add a string filepath here for the log file, default is src/log/translate-bot.log)

## Credits
Most of this work is an extension of code that Relic of ProjectOwl had written, and was cleaned up for easier development and use.
Big thanks to DetectLanguage.com for their awesome, cost-efficient API for running detections.
