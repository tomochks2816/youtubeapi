const express = require("express");
const { Innertube } = require("youtubei.js");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

let yt;

(async () => {
    yt = await Innertube.create();
})();

// 動画情報を取得するAPI
app.get("/video", async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ error: "動画IDが必要です" });

    try {
        const details = await yt.getDetails(videoId);
        res.json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
