import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config(); // Load .env variables

// Load website data from file
const websiteData = fs.readFileSync("data.txt", "utf-8");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Read API key from environment
const HF_API_KEY = process.env.HF_API_KEY;

// Hugging Face model
const MODEL = "facebook/blenderbot-400M-distill";

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Call Hugging Face API with website data included
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `You are a helpful assistant. Use the following website information to answer the user.\n\nWebsite Info:\n${websiteData}\n\nUser: ${userMessage}\nBot:`,
        parameters: { max_new_tokens: 200 }
      })
    });

    const raw = await response.text();
    console.log("RAW HF response:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.json({ reply: "HF API error: " + raw, model: MODEL });
    }

    let botReply = "Hmm, I couldn't generate a response.";
    if (Array.isArray(data) && data[0]?.generated_text) {
      botReply = data[0].generated_text.replace(userMessage, "").trim();
    }

    res.json({ reply: botReply });
  } catch (err) {
    console.error(err);
    res.json({ reply: "Error: " + err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
