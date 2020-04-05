const Telegraf = require('telegraf')

var calDB = []

const isToday = (someDate) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() && someDate.getMonth() == today.getMonth() && someDate.getFullYear() == today.getFullYear()
}

//replace the token with your own token. The one in this file is no longer valid.
const bot = new Telegraf("1173992721:AAFpmymA8BzVaLGWNFA9OQO18Ijg2LV6ZdM")
bot.start((ctx) => {
    calDB.push({
        chat_id: ctx.chat.id,
        entries: []
    })
    ctx.reply('Welcome! To track calories, just send me the calorie amount. To get your logged calories, send me the command /today or /all')
})
bot.help((ctx) => ctx.reply(' To track calories, just send me the calorie amount. To get your logged calories, send me the command /today or /all'))

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

bot.launch()
