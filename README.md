# blip-bot

Blip-bot is a Slack bot for quick everyday stuff: ping checks, weather, short AI answers, channel summaries, timers, goofy fortunes, definitions, ratings, and a friendly reply when you mention it.

## What it uses

- **Runtime:** Node.js
- **Slack:** `@slack/bolt` in Socket Mode
- **AI:** `@google/genai` with `gemini-3.5-flash-lite`
- **Weather:** [wttr.in](https://wttr.in)
- **Config:** `dotenv`

## Commands

| Command | What it does |
|---|---|
| `/blip-ping` | Replies with `Pong` and shows the latency only to you |
| `/blip-weather <place>` | Shows the current weather for `<place>` |
| `/blip-ask <question>` | Sends your question to Gemini and returns a short answer |
| `/blip-summ <style> \| <count>` | Summarizes the last `<count>` messages in the channel in the style you want |
| `/blip-timer <10s|5m|2h>` | Sets a timer and sends a follow-up when it ends |
| `/blip-fortune` | Gives you a weird little fortune |
| `/blip-define <word>` | Gives a short definition of a word |
| `/blip-rate <thing>` | Rates something and gives a funny reason why |
| `/blip-help` | Shows the help message |

## Events

| Event | What it does |
|---|---|
| `app_mention` | Greets you when the bot is mentioned in a channel |

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

Make sure your Slack app has Socket Mode enabled and the needed slash commands and bot scopes set up.

## Run

```bash
node bot.js
```

## License

GPL-3.0
