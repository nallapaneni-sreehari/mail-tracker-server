const emailModel = require('../models/email');

module.exports = class EmailService {
    constructor(req, res)
    {
        this.req = req;
        this.res = res;
        this.params = req?.params;
    }

    async saveEmail()
    {
        console.log(`Email Details :: `, this.req?.body);
        
        var emailObj = 
        {
            sender : this.req.body?.user,
            receiver : this.req.body?.toAddress,
            sentAt : this.req.body?.sentAt,
            uniqueId : this.req.body?.id,
            emailBody : this.req.body?.body,
            emailSubject : this.req.body?.subject
        };

        console.log(`emailObj ::: `, emailObj);
        
        try 
        {
            var response = await emailModel.create(emailObj);
            return response?._id ?? false;

        }
        catch (error) {
            return false;
        }
    }

    async updateEmail()
    {
        console.log(`Email Details :: `, this.params);
        
        var emailObj = await emailModel.findOne({uniqueId:this.params.uniqueId, sender:this.params?.userEmail});

        // console.log(`Before emailObj :: `, emailObj);

        if(emailObj && Object.keys(emailObj)?.length > 0)
        {
            emailObj['openedAt'] = Date.now();
            emailObj['openedBy'] = emailObj['receiver']?.[0]?.name ?? '';
            emailObj.openedTimes = emailObj.openedTimes+1;
        }
        
        // console.log(`Email emailObj :: `, emailObj);

        try 
        {
            var response = await emailModel.updateOne({uniqueId:this.params.uniqueId, sender:this.params?.userEmail},emailObj);

            return emailObj;

        }
        catch (error) {
            return null;
        }
    }

    async getAllEmails()
    {
        const email = this.params.email;
        const skip = this.params.skip ?? 0;
        const limit = 10;
        try {

            var count = await emailModel.count({sender:email});

            var response = await emailModel.find({sender:email}).skip(skip).limit(limit);

            return {response,count};

        } catch (error) {
            return null;
        }
    }

    async findMail()
    {
        try {
            return await emailModel.findOne({uniqueId:this.params.uniqueId, sender:this.params?.userEmail});
        } catch (error) {
            return null;
        }
    }
}