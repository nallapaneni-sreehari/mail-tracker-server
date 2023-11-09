const mongoose = require('mongoose');

async function connect()
{
    const connectionUrl = process.env.MONGODB_URI;

    mongoose.connect(connectionUrl, {useNewUrlParser:true, useUnifiedTopology:true}, (err)=>{
        if(err) throw err;
        console.log("Connected to Database");
    });
}

module.exports = {
    connect:connect
}
