import 'dotenv/config'; // Basically import the dotenv package and call the config at the same time to load the .env
import { GoogleGenAI} from "@google/genai" //import the GoogleGenAI class from the @google/genai package  
import { App } from '@slack/bolt'; // Import the bolt package but only the App class from it (and name it App)
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY); //create a new instance of the GoogleGenAI class and pass the API key from the .env file to it. This will allow us to use the Google Gemini API to generate text
const app = new App({  //creation of a new instance of the app class 
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true
}) //App is a blueprint (Class), app is object . we are changing the certain "keys" of the app class to our own values

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
    const parsedmsg = msghist.messages
    .reverse() //slack gives newest to oldest so we fix that
    .map(msg => `${names[msg.user] || msg.user}: ${msg.text}`)
    .join('\n'); //map the messages to a string of text with the user name and message text
    
    const response = await ai.models.generateContent({ //use the Google Gemini API to generate a summary of the messages
        model: "gemini-3.5-flash-lite", //the model to use
        contents: `Summarize the following conversation. Keep it ${qual}, while preserving the key information: ${parsedmsg}`, //the text to summarize
        temperature: 0.4 //the temperature to use
    });
    await say({text: `The summary of the last ${msghist.messages.lenght} messages is: ${response.text}`}); //respond with the summary
});
(async() => { // basically a function that is called immediately and calls the bot
    await app.start(); //start the app
    console.log('⚡️ Bolt app is running!'); //log to the console that the bot is running
})();


//PS : you see that respond on line 11, respond means the bot will reply in a way its only visible to the user who called the command
// if you want the bot to reply in a way that everyone can see it, you can use say instead of respond. Also backticks are a thing is js