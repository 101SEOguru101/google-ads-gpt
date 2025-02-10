require("dotenv").config();
const axios = require("axios");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const DEVELOPER_TOKEN = process.env.DEVELOPER_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const MCC_CUSTOMER_ID = process.env.CUSTOMER_ID; // MCC ID

// Get OAuth2 Access Token
async function getAccessToken() {
    const url = "https://oauth2.googleapis.com/token";
    const params = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: "refresh_token",
    };

    const response = await axios.post(url, params);
    return response.data.access_token;
}

// Get all accounts under the MCC
async function getAccounts() {
    const accessToken = await getAccessToken();
    
    const query = `
        SELECT customer_client.id, customer_client.descriptive_name
        FROM customer_client
        WHERE customer_client.manager = FALSE
    `;

    const url = `https://googleads.googleapis.com/v14/customers/${MCC_CUSTOMER_ID}/googleAds:search`;

    const response = await axios.post(
        url,
        { query },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "developer-token": DEVELOPER_TOKEN,
                "Content-Type": "application/json",
                "login-customer-id": MCC_CUSTOMER_ID
            },
        }
    );

    return response.data.results.map(client => ({
        id: client.customerClient.id,
        name: client.customerClient.descriptiveName,
    }));
}

// Get campaigns for a specific client account
async function getCampaigns(customerId) {
    const accessToken = await getAccessToken();
    
    const query = `
        SELECT campaign.id, campaign.name, campaign.status
        FROM campaign
        LIMIT 10
    `;

    const url = `https://googleads.googleapis.com/v14/customers/${customerId}/googleAds:search`;

    const response = await axios.post(
        url,
        { query },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "developer-token": DEVELOPER_TOKEN,
                "Content-Type": "application/json",
                "login-customer-id": MCC_CUSTOMER_ID
            },
        }
    );

    return response.data.results.map(campaign => ({
        id: campaign.campaign.id,
        name: campaign.campaign.name,
        status: campaign.campaign.status,
    }));
}

module.exports = { getAccounts, getCampaigns };
