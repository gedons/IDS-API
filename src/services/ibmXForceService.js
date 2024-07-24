const axios = require('axios');
const IBMResponse = require('../models/IBMResponse');
const API_KEY = '262e42d6-8f5f-424b-897e-28f11c96600f';
const API_PASSWORD = 'f51ea424-314b-424e-bf2f-34aec54f350e';
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
        console.log(`Response from IBM X-Force for IP ${ip}:`, response.data);

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
            console.error('Error response data:', error.response.data); // Log the response data for more details
        }
        return null;
    }
};

module.exports = {
    queryIP
};

