const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const requestIp = require('request-ip');
const path = require('path');

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req,res)=>{
    console.log(`Req to Home ::: `, req.body);
});

app.get('/:userEmail/:uniqueId/:ipAddress.jpg', (req,res)=>{
    console.log(`Params::: `, req.params);
    // res.sendFile(path.join(__dirname, "/image.jpg"));
    var buf = new Buffer([
        71,  73,  70,  56,  57,  97,  1,   0,   1,   0, 
        128, 0,   0,   0,   0,   0,   0,   0,   0,   33, 
        249, 4,   1,   0,   0,   0,   0,   44,  0,   0,
        0,   0,   1,   0,   1,   0,   0,   2,   2,   68,  
        1,   0,   59]);
    
    res.writeHead(200, {'Content-Type': 'image/gif' });
    res.end(buf, 'binary');
});

app.get('/getIpAddress', (req,res)=>{
    var ip = req.headers['x-real-ip'] || req.connection.remoteAddress;

    console.log("IP Address is::: ", ip);

    res.status(201).send({message:"Ip fetched successfully!", ipAddress:ip});
})

app.listen(2001, (err)=>{
    if(err) throw err;
    console.log(`Server started on `, 2001);
});