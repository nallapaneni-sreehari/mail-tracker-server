const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const requestIp = require('request-ip');
const path = require('path');


const PORT = process.env.PORT || 5004;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req,res)=>{
    console.log(`Req to Home ::: `, req.body);
});

app.get('/:userEmail/:uniqueId/:ipAddress.jpg', (req,res)=>{
    console.log(`Params::: `, req.params);
    // res.sendFile(path.join(__dirname, "/image.jpg"));
    var imgB64 = "R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
    var bytes = Buffer.from(imgB64, 'base64');

    console.log(`bytes ::: `, bytes);
    

    res.writeHead(200, {'Content-Type': 'image/gif' });
    res.end(bytes, 'binary');
});

app.get('/getIpAddress', (req,res)=>{
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.log("IP Address is::: ", ip);

    res.status(201).send({message:"Ip fetched successfully!", ipAddress:ip});
})

app.listen(PORT, (err)=>{
    if(err) throw err;
    console.log(`Server started on `, PORT);
});