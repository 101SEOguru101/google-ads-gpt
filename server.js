const express = require("express");
const { getAllAccounts, getCampaignsForAllAccounts } = require("./googleAdsClient");

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
    res.json({ message: "Google Ads MCC API is running!" });
});

// ✅ Fix: Use getAllAccounts instead of getAccounts
app.get("/accounts", async (req, res) => {
    try {
        const accounts = await getAllAccounts();
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fix: Fetch Campaigns for ALL MCC Accounts
app.get("/campaigns", async (req, res) => {
    try {
        const campaigns = await getCampaignsForAllAccounts();
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
