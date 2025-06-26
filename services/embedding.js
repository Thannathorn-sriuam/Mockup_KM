// backend/services/embedding.js
const axios = require("axios");

const createEmbedding = async (text) => {
  const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
  const model = "sentence-transformers/all-MiniLM-L6-v2";

  const response = await axios.post(
    `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`,
    {
      inputs: text,
    },
    {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data[0]; // return vector
};

module.exports = { createEmbedding };
