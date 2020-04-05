# building a calorie tracking bot with node.js

In this post we will be building a simple calories tracking telegram bot with nodejs and the telegraf package. The bot will be very simple but can easily be expanded to handle more complex tasks as well.
You will be able to track calories and get the amount of calories you tracked today and the amount of calories you tracked all time.
We will be using a simple in memory store for our database. If you want to persist the entries you can use any database engine you want. The datastructure used to save entries is very simple and can easily be used with any noSQL or sql database engine.

The code of the fully working bot is here:
https://github.com/rallipi/

If you not only want to track calories but your complete life, you should check out the official gymconsle app. It allows you to log any kind of exercise and metric and set them in relation.

But now let's get started with our calories tracking bot.

First let's init a new npm project in an empty folder:

```
npm init
```

Follow the instructions in the console.

then we need to install the only dependency we need. The telegraf telegram bot library. It's a nice wrapper around the official telegram bot api.

```
npm install telegraf
```

Then create our main js file called index.js

```
touch index.js
```

Time to get actually started:

```
const Telegraf = require('telegraf')
```

We imported telegraf to make it accessible in our mainfile.

Next we are going to set up our little ingame datastore.
We will save all entries in a simple array where every element represents the data of a single user:
```
var calDB = []
```

We will have a look at the structure of the entries in a minute.

Now let's create our bot instance:
```
const bot = new Telegraf("yoursecretbottoken)
```
This guide assumes you already created a bot with the help of the botfather telegram bot. That's really easy and only needs some minutes. Replace "yoursecretbottoken" with the actual token the botfather gave you.

Time to create the first interaction that's possible between a user and a bot. The /start command. Every conversation between a user and a bot starts with that command.

```
bot.start((ctx) => {
    calDB.push({
        chat_id: ctx.chat.id,
        entries: []
    })
    ctx.reply('Welcome! To track calories, just send me the calorie amount. To get your logged calories, send me the command /today or /all')
})
```

With bot.start(handler) we're telling our bot what to do, when a user starts a conversation with the bot (we assume every start means a new user. We're just ignoring the fact that users can delete the conversation and start over).
We add a new entry to our db. The entry consists of the current chat id which is part of the context object passed to the handler and an empty array which will hold our calorie tracking entries later.
After we updated the db, we send a reply back to the user. Telegraf has a nice method built into the context object for that.

The next step is to add the help command to the bot. Every bot should provide a help command that explains what the bot does and how to use it. Telegraf has a method that handles that built in:

```
bot.help((ctx) => ctx.reply('To track calories, just send me the calorie amount. To get your logged calories, send me the command /today or /all'))

```
We just reply with a simple text message to the help command. Nothing too fancy here.

Now the core functionality of our bot. The actual calory tracking. i will start explaining this first.But in our index.js file, this part is actually behind the /all and /today commands.That's because telegraf checks which handler to choose sequencially. If the bot.on("text") heandler gets checked before anything else, the other handlers will never get executed.
```
bot.on('text', (ctx) => {
    var from = ctx.message.chat.id
    var content = ctx.message.text
    //try to parse content to int
    var calories = parseInt(content)
    if (isNaN(calories)) {
        ctx.reply("That's not a valid number")
        return;
    }
    //save to db/memory storage
    var userEntries = calDB.find(e => e.chat_id === from);
    if (userEntries != undefined) {
        userEntries.entries.push({
            date: new Date(),
            amount: calories
        })
        ctx.reply('Thanks, calories tracked.')
    } else {
        ctx.reply("User not found")
    }
})
```
With bot.on('text', handler) we're creating a handler that's responsible to handle every text message the bot receives. So basically everything the user sends into the conversation. We extract the sender chat id and the actual content. Then we try to parse the given content to an integer because we expect it to be a calories amount. If it's not an integer, we just don't handle the input.
If it really is a calorie amount, we find the db entry of the user (identified by the chat id) and push a new calorie entry to the entries array. A calory entry consists of the current date and the actual amount.
After the entry was pushed to the db, we just reply to the message notifying the user that the bot processed the request.

Now all that's left is responding to requests asking for already logged calory entries:
```
bot.command('/all', (ctx) => {
    var from = ctx.message.chat.id
    var userEntries = calDB.find(e => e.chat_id === from);
    if (userEntries != undefined) {

        var msg = 'your logged calories:\n';
        userEntries.entries.forEach(e => {
            msg += e.date + ': ' + e.amount + '\n'
        })
        ctx.reply(msg)
    } else {
        ctx.reply("User not found")
    }
})

bot.command('/today', (ctx) => {
    var from = ctx.message.chat.id
    var userEntries = calDB.find(e => e.chat_id === from);
    if (userEntries != undefined) {

        var msg = 'your logged calories for today:\n';
        userEntries.entries.forEach(e => {
            if (isToday(e.date)) {
                msg += e.date + ': ' + e.amount + '\n'
            }
        })
        ctx.reply(msg)
    } else {
        ctx.reply("User not found")
    }
})
```

To get a list of all tracked calories we define the command '/all'. We look up the user entry in our db and loop over every entry and append it to a message that we send over to the user afterwards.
For the calories logged today, it's almost the same. But we only add calorie entries that were logged today. In order to check if the date is today, we have a little helper method 'isToday' which expects a date as the only parameter and checks if the day, the month and the year of the given date match with the current Date().

```
const isToday = (someDate) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
}
```

Finally we have to launch our bot in order to start processing messages:
```
bot.launch()
```

That's it. We're done. Now go to your terminal and type:
```
node index.js
```

You should be able to communicate with your bot now.