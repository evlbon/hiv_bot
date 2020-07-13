const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const Telegraf = require('telegraf');


const mongoClient = new MongoClient("mongodb://localhost:27017/", {useNewUrlParser: true, useUnifiedTopology: true});

const token = "1150786059:AAHLy1Gcbx62puSM91oVAB5o3sSvYC7URYs";
const ObjectsToCsv = require('objects-to-csv');
const bot = new Telegraf(token);

mongoClient.connect((err, client) => {
    const db = client.db("hiv_dump");
    const users = db.collection("users");
    const player = db.collection("player");
    const passage = db.collection("passage");

    (async () => {
        let list = []

        const p = (await passage.find({}).toArray());
        for (const pass of p) {
            const pl = await player.findOne({_id: new ObjectId(pass.playerId)});
            const user = await users.findOne({_id: new ObjectId(pl.userId)});
            const {score, startTime, finishTime} = pass;
            const time = finishTime ? (finishTime - startTime) / 1000 / 60 : 0;
            const {firstName, lastName, school, city, phone} = user;

            list.push({firstName, lastName, school, city, phone, score, time});
        }
        list = list.sort((a,b) => b.score - a.score );

        const csv = new ObjectsToCsv(list);


        // Save to file:
        await csv.toDisk('./test.csv');

    })();

    // bot.command('info', async (ctx) => {
    //     const usersCount = await users.find({}).count();
    //     const passageCount = await passage.find({}).count();
    //     ctx.reply(`Всего пользователей: ${usersCount}\nВошли в игру: ${passageCount}`)
    // });

    try {
        // bot.launch();
        console.log("bot was launched");
    } catch (e) {
        console.log(e)
    }
});