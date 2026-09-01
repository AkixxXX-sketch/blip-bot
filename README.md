# blip-bot

Blip is a multipurpose slack bot that i created for the Stardance program by HackClub.
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
| `/blip-timer <time>` | Sets a timer for <time> and sends a follow-up when it ends |
| `/blip-fortune` | Gives you a weird little fortune |
| `/blip-define <word>` | Gives a short definition of a word |
| `/blip-rate <thing>` | Rates something randomly and justifies it in a goofy manner |
| `/blip-help` | Shows the help message |

## Run

```bash
node bot.js
```
## Note
this bbot is running on HackClub Nest 24/7 

## License

GPL-3.0
