const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const requestIp = require('request-ip');
const path = require('path');
const db = require('./connections/mongodb');
const sevices = require('./services/emailService');
const socket = require('socket.io');
const mongoose = require('mongoose');

const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
      origin: '*',
      credentials: true,
      allowEIO3: true
    }
});

var mySocket;

io.on('connection', socket=>{
    console.log(`Socket connection to server is made !`);
    
    mySocket = socket;
})

const PORT = process.env.PORT || 5004;

app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    // Add other necessary headers here
    next();
});

app.get('/getHealth', (req,res)=>{
    console.log(`Health Checking...`);
    res.status(200).send({status:'success',message:'Server is up and running'});
});

app.get('/:userEmail/:uniqueId/:ipAddress.png', async (req,res)=>{
    console.log(`---------------------------------------------Tracking---------------------------------------`);
    
    console.log(`Params::: `, req.params);

    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.log("Tracking Ip Address ::: ", ip);

    if(req.params.ipAddress != ip) //Compare IPs if same, means that sender only opened the mail
    {
        console.log(`Mail is Opened by Someone!`);

        try {
            const emailService = new sevices(req, res);
    
            var result = await emailService.updateEmail();
    
            console.log(`result ::: `, result);

            io.emit('email-read', result);
            
        } catch (error) {
            console.log(`Error catch updateEmail ::: `, error);
        }
    }
    res.set({
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
    });
    
    res.sendFile(path.join(__dirname, "/assets/img.png"));

    console.log(`-----------------------------------------------------------------------`);
});

app.get('/getIpAddress', async (req,res)=>{
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.log("IP Address is::: ", ip);
    // console.log("mongoose.connection::: ", mongoose.connection.db);
    // console.log("process.env.MONGODB_URI::: ", process.env.MONGODB_URI);
    // let resIp = await mongoose.connection.db.collection('emails').find({}).toArray();

    res.status(201).send({message:"Ip fetched successfully!", ipAddress:ip});
});

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

app.post('/getAllMails/:email', async (req,res)=>{
    console.log(`Getting All Mails ::: `, req.params);
    try {
        
        const emailService = new sevices(req, res);

        var result = await emailService.getAllEmails();

        res.status(200).send({status:'success', message:'successfully fetched data', data:result});
    } catch (error) {
        res.status(500).send({status:'failed', message:'failed to fetch all mails'});
    }
});

app.post('/updateMailOnSent/:userEmail/:uniqueId', async (req,res)=>{
    console.log(`Mail sent Updating ::: `, req.body, req.params);
    
    try {
        const emailService = new sevices(req, res);

        var result = await emailService.findMail();

        console.log(`result :::::: `, result);
        

        result.messageId = req.body?.messageId;

        result.status = (result?.receiver?.length>0 && result?.receiver[0]?.name && result?.receiver[0]?.name !='') ? req.body?.status : 'delivered';

        result.save();
        
        res.status(200).send({status:'success',message:'mail updated successfully'});
    } catch (error) {
        console.log(`Error catch updateEmail when sent ::: `, error);
    }
});

app.get('/getSummary/:userEmail',async (req, res)=>{
    console.log(`Get Summary ::: `, req.body, req.params);

    try {
        const emailService = new sevices(req, res);

        var result = await emailService.getSummary();

        res.status(200).send({status:'success',message:'summary details fetched successfully', data:result});
    } catch (error) {
        res.status(500).send({status:'failed',message:'failed to fetch summary details', data:result});

    }
    
});

app.get('/getSummaryForGraph/:userEmail/:countOf',async (req, res)=>{
    console.log(`Get Summary ::: `, req.body, req.params);

    try {
        const emailService = new sevices(req, res);

        var result = await emailService.getSummaryForGraph();

        res.status(200).send({status:'success',message:'summary details fetched successfully', data:result});
    } catch (error) {
        res.status(500).send({status:'failed',message:'failed to fetch summary details', data:result});

    }
    
});

app.get('/getSummaryForGeoMap/:userEmail/:countOf',async (req, res)=>{
    console.log(`Get Summary ::: `, req.body, req.params);

    try {
        const emailService = new sevices(req, res);

        var result = await emailService.getSummaryCountryWise();

        res.status(200).send({status:'success',message:'summary details fetched successfully', data:result});
    } catch (error) {
        res.status(500).send({status:'failed',message:'failed to fetch summary details', data:result});

    }
    
});

app.post('/saveNotificationSettings',async (req, res)=>{
    console.log(`Get Summary ::: `, req.body, req.params);

    try {
        const emailService = new sevices(req, res);

        var result = await emailService.saveNotificationSettings();

        res.status(200).send({status:'success',message:'summary details fetched successfully', data:result});
    } catch (error) {
        res.status(500).send({status:'failed',message:'failed to fetch summary details', data:result});

    }
    
});

http.listen(PORT, async (err)=>{
    if(err) throw err;
    await db.connect();
    console.log(`Server started on `, PORT);
});
