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
        console.log("✅ Access Token Retrieved Successfully:", response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error("❌ Error getting access token:", error.response?.data || error.message);
        throw new Error("Failed to get access token");
    }
}

// ✅ Function to List All Accessible Accounts
async function listAccessibleAccounts() {
    const accessToken = await getAccessToken();
    const url = "https://googleads.googleapis.com/v14/customers:listAccessibleCustomers";

    console.log(`🔹 Checking accessible accounts at: ${url}`);

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "developer-token": DEVELOPER_TOKEN,
            },
        });

        console.log("✅ Accessible Accounts:", JSON.stringify(response.data, null, 2));
        return response.data.resourceNames || [];
    } catch (error) {
        console.error("❌ API Request Failed:");
        console.error("🔹 HTTP Status:", error.response?.status);
        console.error("🔹 Error Message:", error.response?.data || error.message);
        throw new Error("Failed to fetch accessible accounts");
    }
}

// ✅ API Route to Check Accessible Accounts
async function getAccounts() {
    const accounts = await listAccessibleAccounts();

    if (accounts.length === 0) {
        console.warn("⚠️ No accounts accessible under this MCC.");
        return [];
    }

    console.log("✅ Found Accounts:", accounts);

    return accounts.map(account => ({
        id: account.replace("customers/", ""),
        name: `Account ${account.replace("customers/", "")}`,
    }));
}

// ✅ API Route to Fetch Campaigns for a Given Account
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
            status: campaign.campaign.status,
        }));
    } catch (error) {
        console.error("❌ Error fetching campaigns:");
        console.error("🔹 HTTP Status:", error.response?.status);
        console.error("🔹 Error Message:", error.response?.data || error.message);
        throw new Error("Failed to fetch campaigns");
    }
}

module.exports = { getAccounts, getCampaigns };
