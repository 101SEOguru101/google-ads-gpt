require("dotenv").config();
const axios = require("axios");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const DEVELOPER_TOKEN = process.env.DEVELOPER_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const MCC_CUSTOMER_ID = process.env.CUSTOMER_ID; // Your MCC ID

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
        console.log("✅ Access Token Retrieved Successfully");
        return response.data.access_token;
    } catch (error) {
        console.error("❌ Error getting access token:", error.response?.data || error.message);
        throw new Error("Failed to get access token");
    }
}

// ✅ Function to Fetch ALL Client Accounts Under MCC
async function getAllAccounts() {
    const accessToken = await getAccessToken();
    const url = `https://googleads.googleapis.com/v14/customers/${MCC_CUSTOMER_ID}/googleAds:search`;

    const query = `
        SELECT customer_client.client_customer, customer_client.descriptive_name
        FROM customer_client
        WHERE customer_client.level = 1
    `;

    console.log(`🔹 Fetching accessible accounts from MCC: ${MCC_CUSTOMER_ID}`);

    try {
        const response = await axios.post(
            url,
            { query },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "developer-token": DEVELOPER_TOKEN,
                    "Content-Type": "application/json",
                    "login-customer-id": MCC_CUSTOMER_ID // ✅ MCC ID must be passed in headers
                },
            }
        );

        console.log("✅ Accessible Accounts:", JSON.stringify(response.data, null, 2));

        if (!response.data.results || response.data.results.length === 0) {
            console.warn("⚠️ No client accounts found under MCC.");
            return [];
        }

        return response.data.results.map(client => ({
            id: client.customerClient.clientCustomer,
            name: client.customerClient.descriptiveName,
        }));
    } catch (error) {
        console.error("❌ API Request Failed:");
        console.error("🔹 HTTP Status:", error.response?.status);
        console.error("🔹 Error Message:", error.response?.data || error.message);
        throw new Error("Failed to fetch accessible accounts");
    }
}

// ✅ Function to Fetch Campaigns for ALL Client Accounts
async function getCampaignsForAllAccounts() {
    const accessToken = await getAccessToken();
    const accounts = await getAllAccounts();

    if (accounts.length === 0) {
        throw new Error("No client accounts found under MCC.");
    }

    let allCampaigns = [];

    for (const account of accounts) {
        const customerId = account.id;
        console.log(`🔹 Fetching campaigns for Client Account ID: ${customerId}`);

        const query = `
            SELECT campaign.id, campaign.name, campaign.status
            FROM campaign
            LIMIT 10
        `;

        const url = `https://googleads.googleapis.com/v14/customers/${customerId}/googleAds:search`;

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

            const campaigns = response.data.results.map(campaign => ({
                id: campaign.campaign.id,
                name: campaign.campaign.name,
                status: campaign.campaign.status,
                account_id: customerId
            }));

            allCampaigns.push(...campaigns);
        } catch (error) {
            console.error(`❌ Error fetching campaigns for ${customerId}:`, error.response?.data || error.message);
        }
    }

    return allCampaigns;
}

// ✅ Ensure module exports are properly closed
module.exports = { getAllAccounts, getCampaignsForAllAccounts };
