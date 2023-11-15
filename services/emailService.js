const emailModel = require('../models/email');
const notificationModel = require('../models/notifications');
const { ipToGeo, getIpAddress } = require('../utils/geo');

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
        var status;
        let emailObj = 
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
        
        var ip = this.params.ipAddress;
        // ip = ip.replace(/\n/g, ""); //Replace \n
        var geoInfo = await ipToGeo(ip);
        
        var emailObj = await emailModel.findOne({uniqueId:this.params.uniqueId, sender:this.params?.userEmail});

        // console.log(`Before emailObj :: `, emailObj);

        if(emailObj && Object.keys(emailObj)?.length > 0)
        {
            let geo = {};
            geo[ip] = geoInfo;

            emailObj['openedAt'] = Date.now();
            emailObj['status'] = 'viewed';
            emailObj['geoInfo'] = {...emailObj['geoInfo'], ...geo};

            emailObj['openedBy'] = emailObj['receiver']?.[0]?.name ?? '';
            emailObj.openedTimes = emailObj.openedTimes+1;
        }
        
        // console.log(`Email emailObj :: `, emailObj);

        try 
        {
            // var response = await emailModel.updateOne({uniqueId:this.params.uniqueId, sender:this.params?.userEmail},emailObj);
            emailObj.save();
            return emailObj;

        }
        catch (error) {
            return null;
        }
    }

    async getAllEmails()
    {
        const body = this.req.body;
        console.log(`body :: `, body);
        const email = this.params.email;
        const skip = this.params.skip ?? 0;
        const limit = 100;
        let query = { sender: email };
        if(body.selectFilter && body.selectFilter.toLowerCase() != "all")
            query['status'] = body.selectFilter;
        if(body.searchFilter)
            query['emailSubject'] = {$regex: body.searchFilter, $options: 'i'};
        if (body.fromDate && body.toDate) {
            query['sentAt'] = { $gte: new Date(body.fromDate) };
            query['sentAt'] = { $lte: new Date(body.toDate) };
        }
        console.log(`query :: `, query);
        try {

            var count = await emailModel.count(query);

            var response = await emailModel.find(query).skip(skip).limit(limit).sort({_id: -1});

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

    async getSummary()
    {
        try {
            var sent = await emailModel.count({sender:this.params?.userEmail, status: {$in: ['sent','delivered', 'viewed']}});
            var delivered = await emailModel.count({sender:this.params?.userEmail, status: {$in: ['delivered', 'viewed']}});
            // var opened = await emailModel.count({sender:this.params?.userEmail, openedAt:{ "$exists": true }});
            var opened = await emailModel.count({ sender: this.params?.userEmail, status: 'viewed' });
            var notOpened = await emailModel.count({sender:this.params?.userEmail, openedAt:{ "$exists": false }});
            
            return{sent, delivered, opened, notOpened};
            
        } catch (error) {
            return null;
        }
    }

    async getSummaryForGraph()
    {
        let { userEmail, countOf, year=2023 } = this.params;
        countOf = countOf == "delivered" ? ["viewed", "delivered"] : countOf == "sent" ? ["sent", "delivered", "viewed"] : [countOf];
        let query = [
            {$match: {sender: userEmail}},
            {
                $group: {
                    _id: {
                        year: { $year: "$sentAt" },
                        month: { $month: "$sentAt" }
                    },
                    total: {
                        $sum: {
                            $cond: {
                                if: { $in: ["$status", countOf] },
                                then: 1,
                                else: 0
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    year: "$_id.year",
                    total: "$total"
                }
            },
            { $match: { year: year } }
        ];

        try {
            // console.log(`query :: `, JSON.stringify(query));
            var count = await emailModel.aggregate(query);
            console.log(`Total :: `, count);
            return count;
        } catch (error) {
            return null;
        }
    }

    async getSummaryCountryWise()
    {
        let { userEmail, countOf, year=2023 } = this.params;

        let query = [
            { $match: { sender: userEmail } },
            {
                $addFields: {
                    geoInfoArray: { $objectToArray: "$geoInfo" } // Convert geoInfo to an array
                }
            },
            { $unwind: "$geoInfoArray" },
            {
                $group: {
                    _id: "$geoInfoArray.v.country",
                    sent: {
                        $sum: {
                            $cond: {
                                if: { $in: ["$status", ["sent", "delivered", "viewed"]] },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    viewed: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$status", "viewed"] },
                                then: 1,
                                else: 0
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    //       Country: "$_id.country",
                    sent: "$sent",
                    viewed: "$viewed"
                }
            }
        ];

        try {
            // console.log(`query :: `, JSON.stringify(query));
            var count = await emailModel.aggregate(query);
            console.log(`Total getSummaryCountryWise:: `, count);
            return count;
        } catch (error) {
            return null;
        }
    }

    async saveNotificationSettings() {
        try {
            let body = this.req.body;
            // let result = await emailModel.updateOne({sender: email}, {$set: update});
            let response = {};
            let result = await notificationModel.findOne({ email: body.email });
            if (result) {
                result[body.mode] = body.enabled;
                if (body.value)
                    result['mobile'] = body.value;
                await result.save();
                response = result;
            }
            else {
                let notification = {};
                notification[body.mode] = body.enabled;
                if (body.value)
                    notification['mobile'] = body.value;
                response = new notificationModel(notification);
                response = response.save();
            }
            return response
        } catch (error) {
            console.log(`E : `, error);
            return null;
        }
    }
}