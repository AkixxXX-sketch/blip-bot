import 'dotenv/config'; // Basically import the dotenv package and call the config at the same time to load the .env
import { GoogleGenAI} from "@google/genai" //import the GoogleGenAI class from the @google/genai package  
import { App } from '@slack/bolt'; // Import the bolt package but only the App class from it (and name it App)
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY); //create a new instance of the GoogleGenAI class and pass the API key from the .env file to it. This will allow us to use the Google Gemini API to generate text
const app = new App({  //creation of a new instance of the app class 
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true
}) //App is a blueprint (Class), app is object . we are changing the certain "keys" of the app class to our own values
function parseTime(time) { //function to parse the time input by the user
    const regex = /^(\d+)([smh])$/; //regex to match the time format (e.g., 10s, 5m, 2h)
    const match = time.match(regex); 
    if (!match) return null;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case 's':
            return value * 1000;
        case 'm':
            return value * 60 * 1000;
        case 'h':
            return value * 60 * 60 * 1000;
        default:
            return null;
    }
}

app.command('/blip-ping', async ({ command, ack, respond }) => {  //so we call the method command of the app object. argument one is the command name
// the second argument is a function that is defined right there with () => {} the function has 3 parameters command ack and say
// command is what you got from the user, ack is a function that you need to call to acknowledge the command and say is a response
    const start = Date.now(); //have a variable called start which contains current time
    await ack(); //acknowledge the command 
    const latency = Date.now() - start; //measure latency by subtracting the start time from the current time
    await respond({text: `Pong\nLatency: ${latency}ms`}); //respond with pong and latency
});  
app.command('/blip-weather', async ({ command, ack, say }) => { 
    await ack();
    const place = command.text; //get the text after the command and store it as place
    const weather = await fetch(`https://wttr.in/${place}?format=%C+%t+%f`); //fetch the weather from the wttr.in 
    const weatherData = await weather.text();
    await say({text: `The weather in ${place} is: ${weatherData}`});
});
app.command('/blip-ask', async ({ command, ack, say }) => { 
    await ack();
    const question = command.text; //get the text after the command and store it as question
    const response = await ai.models.generateContent({ //use the Google Gemini API to generate a response to the question
        model: "gemini-3.5-flash-lite", //the model to use
        contents: `Respond to the following question in minimal words, unless specified otherwise: ${question}`, //the question to ask
        temperature: 0.4 //the temperature to use
    });
    await say({text: `The answer to your question is: ${response.text}`});
});
app.command('/blip-summ', async ({ command, ack, say, client }) => {
    await ack();
    const users = await client.users.list(); //get a list of all users in the workspace
    const names = Object.fromEntries(
        users.members.map(user => [
            user.id, //get the user id and map it to the display name or real name or username of the user
            user.profile.display_name || user.real_name || user.name //get the display name or real name or username of the user
        ])
    )
    const [qual, msgs] = command.text.split('|'); //split the text after the command into an array of arguments    
    const limit = Number(msgs) || 20; //set the limit to the number of messages to summarize
    const msghist = await client.conversations.history({ //get the message history of the channel
        channel: command.channel_id, //the channel id of the channel where the command was called
        limit: limit //the limit of messages to get
    });
    //join the messages into a single string
    console.log(JSON.stringify(msghist.messages, null, 2));
    const parsedmsg = msghist.messages
    .reverse() //slack gives newest to oldest so we fix that
    .map(msg => {
        const name = names[msg.user] || 'Unknown User'; //get the name of the user who sent the message
        const text = msg.text
        .replace(
            /<@([A-Z0-9]+)>/g, //regex to match the user mentions in the message
            (_, userId) => names[userId] || 'Unknown User'
        )
        .replace(
            /`(U[A-Z0-9]+)`/g, //regex to match the user mentions in the message
            (_, userId) => names[userId] || 'Unknown User'
        );
        return `${name}: ${text}`
    })
    .join('\n'); //map the messages to a string of text with the user name and message text
    
    const response = await ai.models.generateContent({ //use the Google Gemini API to generate a summary of the messages
        model: "gemini-3.5-flash-lite", //the model to use
        contents: `Summarize the following conversation. Keep it ${qual}, while preserving the key information: ${parsedmsg}`, //the text to summarize
        temperature: 0.4 //the temperature to use
    });
    await say({text: `The summary of the last ${msghist.messages.length} messages is: ${response.text}`}); //respond with the summary
});

app.command('/blip-timer', async ({ command, ack, say }) => {
    await ack();
    const time = command.text;
    const timeInMs = parseTime(time);
    if (timeInMs === null) {
        await say({text: `Invalid time format. Please use a format like "10s", "5m", or "2h".`});
        return;
    }
    await say({text: `Timer set for ${time}. I will notify you when the time is up.`});
    setTimeout(async () => {
        await say({text: `⏰ Time's up! Your ${time} timer has ended.`});
    }, timeInMs);
});
app.command('/blip-fortune', async ({ command, ack, say }) => {
    await ack();
    const styles = [
    "an oddly specific prediction",
    "a bizarre but harmless event",
    "a ridiculous prediction about technology",
    "a strange coincidence",
    "an absurd prediction involving food",
    "a completely unexpected personal prophecy",
    "a prediction that sounds profound but is actually stupid",
    "a mundane event described as if it were destiny",
    "a prediction involving an object",
    "a surreal but coherent prediction"
    ];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: `Generate ONE short fortune.

            Style: ${randomStyle}

            Rules:
            - Exactly one sentence.
            - Grammatically coherent.
            - Must be understandable.
            - Must be weird or funny.
            - Avoid fortune-cookie clichés.
            - Do not use animals judging people.
            - Do not mention raccoons, pigeons, geese, fashion, life choices, or specific clock times.
            - Do not explain anything.
            - Output only the fortune.
            `,

        temperature: 1
    });
    await say({text: `Your fortune: ${response.text}
        `});    
});
app.command('/blip-help', async ({ command, ack, say }) => {
    await ack();
    const helpMessage = `
    Here are the available commands:
    
    1. /blip-ping - Check the bot's latency.
    2. /blip-weather [location] - Get the current weather for a specified location.
    3. /blip-ask [question] - Ask a question and get an AI-generated response.
    4. /blip-summ [quality] | [number of messages] - Summarize the last N messages in the channel with specified quality (e.g., "brief", "detailed").
    5. /blip-timer [time] - Set a timer for a specified duration (e.g., "10s", "5m", "2h").
    6. /blip-fortune - Get a random, weird, or funny fortune.
    7. /blip-help - Display this help message.
    8. /blip-define [word] - Get a clear and concise definition for a specified word.
    9. /blip-rate [thing] - Get a random rating and a humorous reason for the rating of a specified thing.
    
    Note: For commands that require additional input, please provide the necessary information after the command.
    `;
    await say({text: helpMessage});
});
app.command('/blip-define', async ({ command, ack, say }) => {
    await ack();
    const word = command.text.trim();
    if (!word) {
        await say({text: `Please provide a word to define. Usage: /blip-define [word]`});
        return;
    }
    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: `Provide a clear and concise definition for the word: "${word}".`,
        temperature: 0.4
    });
    await say({text: `Definition of "${word}": ${response.text}`});
});
app.command('/blip-rate', async ({ command, ack, say }) => {
    await ack();
    const thing = command.text.trim();
    if (!thing) {
        await say({text:'Rate what💀'});
        return;
    }
    const rating = Math.random() * 10; // Generate a random rating between 0 and 10
    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: `
        Rate this: "${thing}"
        Give a completely ridiculous but coherent (somewhat) for the rating.
        Rules:
        - The rating is ${rating}/10.
        - Treat whatever is being rated as valid, whether it is a person, object, idea, food, event, animal, code, etc.
        - Do not question what is being rated.
        - Do not change the rating.
        - Be unpredictable and funny.
        - The reasoning should be short.
        - Do not be genuinely insulting or cruel toward a person.
        - Output ONLY the reason for the rating, not the rating itself.
        `,
        temperature: 1.0
    });
    await say({text: `Rating for "${thing}": ${rating.toFixed(1)}/10\nReason: ${response.text}`});
});
app.event('app_mention', async ({ event, say }) => {
    await say(`Hello <@${event.user}>! How can I assist you today?`);
    console.log(`App was mentioned by user ${event.user} in channel ${event.channel}`);
});
(async() => { // basically a function that is called immediately and calls the bot
    await app.start(); //start the app
    console.log('⚡️ Bolt app is running!'); //log to the console that the bot is running
})();


//PS : you see that respond on line 11, respond means the bot will reply in a way its only visible to the user who called the command
// if you want the bot to reply in a way that everyone can see it, you can use say instead of respond. Also backticks are a thing is js