require('dotenv').config(); // Basically import the dotenv package and call the config at the same time to load the .env

const { App } = require('@slack/bolt'); // Import the bolt package but only the App class from it (and name it App)

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

(async() => { // basically a function that is called immediately and calls the bot
    await app.start(); //start the app
    console.log('⚡️ Bolt app is running!'); //log to the console that the bot is running
})();


//PS : you see that respond on line 11, respond means the bot will reply in a way its only visible to the user who called the command
// if you want the bot to reply in a way that everyone can see it, you can use say instead of respond. Also backticks are a thing is js