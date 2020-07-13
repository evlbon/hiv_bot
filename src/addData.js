let fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const mongoClient = new MongoClient("mongodb://localhost:27017/", {useNewUrlParser: true, useUnifiedTopology: true});


async function addData() {
    const data = await fs.readFileSync(__dirname + '/../Results.csv');

    let bufferString = data.toString();

    let arr = bufferString.split('\n');

    const list = [];


    for (let i = 1; i < arr.length; i++) {
        let [, firstName, lastName, , city, school, , , , phone] = arr[i].split('","');
        if (firstName && lastName && city && school && phone)
            list.push({firstName, lastName, city, school,
                phone: phone.replace('+', ''),
                classroom: Math.random()>0.5?'9':'10'})
    }

    return list;
}


mongoClient.connect(async (err, client) => {
    const list = await addData();

    const db = client.db("hiv_dump");
    const users = db.collection("users");

    const addedUsers = db.collection("addedUsers");

    const need = 1037 - await users.find({phone: {$exists: true}}).count();

    let success = 0, additionalData = [];

    for(let i of list){
        if(success >= need)
            break;

        if(!await users.findOne({phone: i.phone})){
            success += 1;
            additionalData.push(i)
        }
    }

    await addedUsers.insertMany(additionalData);

    console.log(additionalData)
});
