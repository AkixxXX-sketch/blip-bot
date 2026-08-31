# blip-bot

A Slack bot built with [Slack Bolt](https://slack.dev/bolt-js/) (Socket Mode) and Google's Gemini API. Ping checks, weather lookups, quick AI answers, channel summarization, timers, fortunes, and a friendly app mention reply — all as slash commands and Slack events.

## Stack

- **Runtime:** Node.js
- **Slack integration:** `@slack/bolt` (Socket Mode)
- **AI:** `@google/genai` — `gemini-3.5-flash-lite`
- **Weather:** [wttr.in](https://wttr.in)
- **Config:** `dotenv`

## Commands

| Command | Description |
|---|---|
| `/blip-ping` | Replies with `Pong` and round-trip latency (visible only to the caller) |
| `/blip-weather <place>` | Fetches current weather for `<place>` from wttr.in |
| `/blip-ask <question>` | Sends the question to Gemini and returns a short answer |
| `/blip-summ <style> \| <count>` | Summarizes the last `<count>` messages in the channel (default 20) in the given style/tone |
| `/blip-timer <10s|5m|2h>` | Sets a timer and posts a follow-up message when time is up |
| `/blip-fortune` | Generates a short goofy fortune from Gemini |

## Events

| Event | Description |
|---|---|
| `app_mention` | Replies with a friendly greeting when the bot is mentioned in a channel |

## Setup

```bash
git clone https://github.com/Thorn-probably/blip-bot.git
cd blip-bot
npm install
```

Create a `.env` file in the project root:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
GEMINI_API_KEY=your-gemini-api-key
```

Your Slack app needs **Socket Mode** enabled (that's what `SLACK_APP_TOKEN` is for) plus the slash commands above registered, and bot scopes for reading channel history and listing users (`channels:history`, `users:read`, `commands`, `chat:write`, etc.).

## Run

```bash
node bot.js
```

## License

GPL-3.0
