const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const requestIp = require('request-ip');
const path = require('path');
const db = require('./connections/mongodb');
const sevices = require('./services/emailService');

const PORT = process.env.PORT || 5004;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req,res)=>{
    console.log(`Req to Home ::: `, req.body);
});

app.get('/:userEmail/:uniqueId/:ipAddress.png', async (req,res)=>{
    console.log(`---------------------------------------------Tracking---------------------------------------`);
    
    console.log(`Params::: `, req.params);

    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.log("Tracking Ip Address ::: ", ip);

    if(req.params.ipAddress != ip)
    {
        console.log(`Mail is Opened by Someone!`);

        try {
            const emailService = new sevices(req, res);
    
            var result = await emailService.updateEmail();
    
            console.log(`result ::: `, result);
            
        } catch (error) {
            console.log(`Error catch updateEmail ::: `, error);
        }
    }

    res.sendFile(path.join(__dirname, "/assets/img.png"));

    console.log(`-----------------------------------------------------------------------`);
});

app.get('/getIpAddress', (req,res)=>{
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.log("IP Address is::: ", ip);

    res.status(201).send({message:"Ip fetched successfully!", ipAddress:ip});
})

app.post('/saveEmail', async (req,res)=>{
    try {
        const emailService = new sevices(req, res);

        var result = await emailService.saveEmail();

        res.status(201).send({status:'success', message:'email created successfully', data:result});

    } catch (error) {
        console.log(`Error catch saveEmail ::: `, error);
        res.status(500).send({status:'failed', message:'failed to save Email'});   
    }
});

app.listen(PORT, async (err)=>{
    if(err) throw err;
    await db.connect();
    console.log(`Server started on `, PORT);
});