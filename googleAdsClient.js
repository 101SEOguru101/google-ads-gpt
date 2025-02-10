{\rtf1\ansi\ansicpg1252\cocoartf2758
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 require("dotenv").config();\
const express = require("express");\
const \{ getCampaigns \} = require("./googleAdsClient");\
const axios = require("axios");\
\
const app = express();\
const PORT = process.env.PORT || 3000;\
\
app.use(express.json());\
\
// Home Route\
app.get("/", (req, res) => \{\
    res.send(\{ message: "Google Ads Chatbot API is running!" \});\
\});\
\
// Fetch Google Ads Campaigns\
app.get("/campaigns", async (req, res) => \{\
    try \{\
        const campaigns = await getCampaigns();\
        res.json(campaigns);\
    \} catch (error) \{\
        res.status(500).json(\{ error: error.message \});\
    \}\
\});\
\
// OpenAI Chatbot\
app.post("/chat", async (req, res) => \{\
    const \{ prompt \} = req.body;\
    \
    try \{\
        const response = await axios.post(\
            "https://api.openai.com/v1/chat/completions",\
            \{\
                model: "gpt-4",\
                messages: [\{ role: "user", content: prompt \}],\
            \},\
            \{\
                headers: \{\
                    Authorization: `Bearer $\{process.env.OPENAI_API_KEY\}`,\
                    "Content-Type": "application/json",\
                \},\
            \}\
        );\
        \
        res.json(\{ response: response.data.choices[0].message.content \});\
    \} catch (error) \{\
        res.status(500).json(\{ error: error.message \});\
    \}\
\});\
\
// Start Server\
app.listen(PORT, () => \{\
    console.log(`Server running on port $\{PORT\}`);\
\});\
}