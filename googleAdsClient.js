require("dotenv").config();
const axios = require("axios");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const DEVELOPER_TOKEN = process.env.DEVELOPER_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const MCC_CUSTOMER_ID = process.env.CUSTOMER_ID; // ✅ Your MCC ID
const CLIENT_ACCOUNT_ID = "1918019730"; // ✅ Your Client Account ID

// ✅ Function to Get OAuth2 Access Token
async function getAccessToken() {
    const url = "https://oauth2.googleapis.com/token";
    const params = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: "refresh_token",
    };

    try {
        const response = await axios.post(url, params);
        console.log("✅ Access Token Retrieved Successfully:", response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error("❌ Error getting access token:", error.response?.data || error.message);
        throw new Error("Failed to get access token");
    }
}

// ✅ Function to Fetch All Client Accounts Under MCC
async function getAccounts() {
    const accessToken = await getAccessToken();

    const query = `
        SELECT customer_client.id, customer_client.descriptive_name
        FROM customer_client
        WHERE customer_client.manager = FALSE
    `;

    const url = `https://googleads.googleapis.com/v14/customers/${CLIENT_ACCOUNT_ID}/googleAds:search`;

    console.log(`🔹 Making request to: ${url}`);

    try {
        const response = await axios.post(
            url,
            { query },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "developer-token": DEVELOPER_TOKEN,
                    "Content-Type": "application/json",
                    "login-customer-id": MCC_CUSTOMER_ID // ✅ Required for MCC Queries
                },
            }
        );

        console.log("✅ API Response:", JSON.stringify(response.data, null, 2));

        if (!response.data.results || response.data.results.length === 0) {
            console.warn("⚠️ No client accounts found under MCC.");
            return [];
        }

        return response.data.results.map(client => ({
            id: client.customerClient.id,
            name: client.customerClient.descriptiveName,
        }));
    } catch (error) {
        console.error("❌ API Request Failed:");
        console.error("🔹 HTTP Status:", error.response?.status);
        console.error("🔹 Error Message:", error.response?.data || error.message);
        throw new Error("Failed to fetch Google Ads client accounts");
    }
}

// ✅ Function to Fetch Campaigns for Any Client Account
async function getCampaigns(customerId) {
    const accessToken = await getAccessToken();
    
    const query = `
        SELECT campaign.id, campaign.name, campaign.status
        FROM campaign
        LIMIT 10
    `;

    const url = `https://googleads.googleapis.com/v14/customers/${customerId}/googleAds:search`;

    console.log(`🔹 Fetching campaigns for: ${customerId}`);

    try {
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

        console.log("✅ Campaigns Response:", JSON.stringify(response.data, null, 2));

        return response.data.results.map(campaign => ({
            id: campaign.campaign.id,
            name: campaign.campaign.name,
            status: campaign.campaign.status
