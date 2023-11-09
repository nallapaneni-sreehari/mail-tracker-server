const mongoose = require('mongoose');

async function connect() {
    const connectionUrl = process.env.MONGODB_URI || "mongodb+srv://r151149:sree123@cluster0.ecexy.mongodb.net/track-the-mail-db?retryWrites=true&w=majority";

    console.log('connectionUrl  :: ', connectionUrl);
    return new Promise((resolve, reject)=>{
        mongoose.connect(connectionUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
            if (err) throw err;
            console.log("Connected to Database");
            resolve('ok');
        });
    });
}

module.exports = {
    connect: connect
}
