const IP_INFO_API = "d9a7d1d847635c";
const axios = require('axios');

const ipinfoApiKey = 'd9a7d1d847635c'; // Sign up for a free API key at https://ipinfo.io/signup

async function getIpInfo(ip) {
    try {
        const response = await axios.get(`http://ipinfo.io/${ip}?token=${ipinfoApiKey}`);
        console.log(`response.data :: `, response.data);
        return response.data;
    } catch (error) {
        console.log(`E :: `, error);
        throw error;
    }
}

async function ipToGeo(lookupIp) {
    try {
        const ipInfo = await getIpInfo(lookupIp);
        let geoInfo = {};

        if (ipInfo && ipInfo.country && ipInfo.region) {
            const country = ipInfo.country;
            const state = ipInfo.region;
            geoInfo['country'] = country;
            geoInfo['state'] = state;

            console.log(`IP: ${lookupIp}`);
            console.log(`Country: ${country}`);
            console.log(`State: ${state}`);
        } else {
            console.log('Unable to retrieve location information.');
        }
        return geoInfo;
    } catch (error) {
        console.error('Error:', error.message);
        return {};
    }
}

async function getIpAddress(){
    const url = 'https://icanhazip.com/';
    try {
        const response = await axios.get(url);
        console.log(`response :: `, response.data);
        return response.data;
    } catch (error) {
        return null;
    }
}
module.exports = {
    ipToGeo,
    getIpAddress
}