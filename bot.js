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

(async() => { // basically a function that is called immediately and calls the bot
    await app.start(); //start the app
    console.log('⚡️ Bolt app is running!'); //log to the console that the bot is running
})();


//PS : you see that respond on line 11, respond means the bot will reply in a way its only visible to the user who called the command
// if you want the bot to reply in a way that everyone can see it, you can use say instead of respond. Also backticks are a thing is js