# translate-bot

This project is a Discord bot that listens to a discord server for messages containing twitter links, and responds to them with translated links in english.

UNDER DEVELOPMENT

## Configuration

### To run it

Run `npm install` from the project root to get all the node_modules you need

The bot will rely on a few environment variables being available to work properly

| Item | environment variable? | Notes |
| --- | --- | --- |
| Discord Bot API Token | DISCORD_TRANSLATE_TOKEN | https://www.writebots.com/discord-bot-token/ |
| Google Translate API Token | GOOGLE_TRANSLATE_KEY | --- |
| Twitter Consumer Key | TWITTER_CONSUMER_KEY | --- |
| Twitter Secret Key | TWITTER_SECRET_KEY | --- |
| Twitter Bearer Token | TWITTER_BEARER_TOKEN | --- |

The bot can be run with 
`DISCORD_TRANSLATE_TOKEN=<DISCORD_TRANSLATE_TOKEN> GOOGLE_TRANSLATE_KEY=<GOOGLE_TRANSLATE_KEY> TWITTER_CONSUMER_KEY=<TWITTER_CONSUMER_KEY> TWITTER_SECRET_KEY=<TWITTER_SECRET_KEY> TWITTER_BEARER_TOKEN=<TWITTER_BEARER_TOKEN> node src/app.js`

### Configuration values
All configurations for the bot are kept in src/config/config.json (except the log format). There is an example-config.json you can copy to get started, but tune parameters as needed for logging and such.

#### logger
level = ["trace", "debug", "info", "warn", "error"]

file = (Add a string filepath here for the log file, default is src/log/translate-bot.log)

## Credits
Most of this work is an extension of code that Relic of ProjectOwl had written, and was cleaned up for easier development and use.