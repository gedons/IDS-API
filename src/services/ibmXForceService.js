const axios = require('axios');
const IBMResponse = require('../models/IBMResponse');
const API_KEY = 'fbc82f3e-6537-4e1f-8d24-6f924db8f806';
const API_PASSWORD = '8683a061-fdac-474b-aa3e-b77c826b336a';
const BASE_URL = 'https://api.xforce.ibmcloud.com';


const queryIP = async (ip, logId, userId) => {
    try {
        // Encode API key and password in Base64
        const authString = `${API_KEY}:${API_PASSWORD}`;
        const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;       

        const response = await axios.get(`${BASE_URL}/ipr/${ip}`, {
            headers: {
                'Authorization': authHeader
            }
        });
        // console.log(`Response from IBM X-Force for IP ${ip}:`, response.data);

        // Save response to the database
        const newIBMResponse = new IBMResponse({
            user: userId,
            log: logId,
            ip,
            response: response.data
        });
        await newIBMResponse.save();

        return response.data;
    } catch (error) {
        console.error(`Error querying IBM X-Force for IP ${ip}:`, error.message);
        if (error.response) {
            console.error('Error response data:', error.response.data); 
        }
        return null;
    }
};

module.exports = {
    queryIP
};

