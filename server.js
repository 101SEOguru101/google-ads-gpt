require("dotenv").config();
const express = require("express");
const { getAccounts, getCampaigns } = require("./googleAdsClient");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Home Route
app.get("/", (req, res) => {
    res.send({ message: "Google Ads MCC API is running!" });
});

// Get all Google Ads accounts under MCC
app.get("/accounts", async (req, res) => {
    try {
        const accounts = await getAccounts();
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get campaigns for a specific Google Ads account
app.get("/campaigns", async (req, res) => {
    const { customer_id } = req.query;

    if (!customer_id) {
        return res.status(400).json({ error: "Missing required parameter: customer_id" });
    }

    try {
        const campaigns = await getCampaigns(customer_id);
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
