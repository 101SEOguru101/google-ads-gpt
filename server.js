const express = require("express");
const { checkMCC, getAllAccounts, getCampaignsForAllAccounts } = require("./googleAdsClient");

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
    res.json({ message: "Google Ads MCC API is running!" });
});

// ✅ Add a new route to check MCC status
app.get("/check-mcc", async (req, res) => {
    try {
        const mccStatus = await checkMCC();
        res.json(mccStatus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fix: Fetch ALL MCC accounts
app.get("/accounts", async (req, res) => {
    try {
        const accounts = await getAllAccounts();
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fix: Fetch campaigns for ALL MCC accounts
app.get("/campaigns", async (req, res) => {
    try {
        const campaigns = await getCampaignsForAllAccounts();
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
