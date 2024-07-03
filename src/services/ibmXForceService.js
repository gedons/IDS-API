const axios = require('axios');

const API_KEY = '7fdea840-aa52-47ee-87b1-0dcee29d5004';
const API_PASSWORD = '4ef450da-21d3-4da3-bd6d-904d72b8bc82';
const BASE_URL = 'https://api.xforce.ibmcloud.com';


const queryIP = async (ip) => {
    try {
        // Encode API key and password in Base64
        const authString = `${API_KEY}:${API_PASSWORD}`;
        const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;
        console.log('Authorization Header:', authHeader); // Log the authorization header for debugging

        const response = await axios.get(`${BASE_URL}/ipr/${ip}`, {
            headers: {
                'Authorization': authHeader
            }
        });
        console.log(`Response from IBM X-Force for IP ${ip}:`, response.data); // Log the response data
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


