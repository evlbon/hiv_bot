const MongoClient = require('mongodb').MongoClient;
const Telegraf = require('telegraf');

const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true, useUnifiedTopology: true });

const token = "1150786059:AAHLy1Gcbx62puSM91oVAB5o3sSvYC7URYs";
const bot = new Telegraf(token);

mongoClient.connect((err, client) => {
    const db = client.db("hiv");
    const users = db.collection("users");
    const passage = db.collection("passage");

    bot.command('info', async (ctx) => {
        const usersCount = await users.find({}).count();
        const passageCount = await passage.find({}).count();
        ctx.reply(`Всего пользователей: ${usersCount}\nВошли в игру: ${passageCount}`)
    });

    try {
        bot.launch();
        console.log("bot was launched");
    }catch (e) {
        console.log(e)
    }
});