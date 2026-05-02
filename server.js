const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// 🎯 Core function
function generateOutcome(serverSeed, clientSeed, nonce, houseEdge, slice, minMultiplier, maxMultiplier) {
    const hash = crypto
        .createHmac("sha512", serverSeed)
        .update(`${clientSeed}:${nonce}`)
        .digest("hex");

    const resultInt = parseInt(hash.substring(0, slice), 16);

    if (resultInt === 0) return minMultiplier;

    let multiplier = ((1 - houseEdge) * 0xFFFFFFFF) / resultInt;

    multiplier = Math.max(minMultiplier, multiplier);

    if (maxMultiplier) {
        multiplier = Math.min(multiplier, maxMultiplier);
    }

    return multiplier.toFixed(2);
}

// 🚀 API endpoint
app.post("/generate", (req, res) => {
    const {
        houseEdge = 0.03,
        slice = 8,
        minMultiplier = 1,
        maxMultiplier = null
    } = req.body;

    const serverSeed = crypto.randomBytes(32).toString("hex");
    const clientSeed = crypto.randomBytes(16).toString("hex");
    const nonce = Date.now();

    const result = generateOutcome(
        serverSeed,
        clientSeed,
        nonce,
        houseEdge,
        slice,
        minMultiplier,
        maxMultiplier
    );

    res.json({
        result,
        serverSeed,
        clientSeed,
        nonce
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
