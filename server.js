{\rtf1\ansi\ansicpg1252\cocoartf2758
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 require("dotenv").config();\
const axios = require("axios");\
\
const CLIENT_ID = process.env.CLIENT_ID;\
const CLIENT_SECRET = process.env.CLIENT_SECRET;\
const DEVELOPER_TOKEN = process.env.DEVELOPER_TOKEN;\
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;\
const CUSTOMER_ID = process.env.CUSTOMER_ID;\
\
async function getAccessToken() \{\
    const url = "https://oauth2.googleapis.com/token";\
    const params = \{\
        client_id: CLIENT_ID,\
        client_secret: CLIENT_SECRET,\
        refresh_token: REFRESH_TOKEN,\
        grant_type: "refresh_token",\
    \};\
\
    const response = await axios.post(url, params);\
    return response.data.access_token;\
\}\
\
async function getCampaigns() \{\
    const accessToken = await getAccessToken();\
    \
    const query = `\
        SELECT campaign.id, campaign.name, campaign.status\
        FROM campaign\
        LIMIT 10\
    `;\
\
    const url = `https://googleads.googleapis.com/v14/customers/$\{CUSTOMER_ID\}/googleAds:search`;\
    \
    const response = await axios.post(\
        url,\
        \{ query \},\
        \{\
            headers: \{\
                Authorization: `Bearer $\{accessToken\}`,\
                "developer-token": DEVELOPER_TOKEN,\
                "Content-Type": "application/json",\
            \},\
        \}\
    );\
\
    return response.data.results.map(campaign => (\{\
        id: campaign.campaign.id,\
        name: campaign.campaign.name,\
        status: campaign.campaign.status,\
    \}));\
\}\
\
module.exports = \{ getCampaigns \};\
}