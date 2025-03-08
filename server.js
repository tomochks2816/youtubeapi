const express = require("express");
const { Innertube } = require("youtubei.js");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

let yt;

(async () => {
    try {
        yt = await Innertube.create();
        console.log("YouTube API initialized successfully.");
    } catch (error) {
        console.error("Error initializing YouTube API:", error.message);
    }
})();

// 動画情報を取得するAPI
app.get("/video", async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        console.error("Error: Video ID is missing.");
        return res.status(400).json({ error: "動画IDが必要です" });
    }

    try {
        console.log(`Fetching details for video ID: ${videoId}`);
        const video = await yt.getDetails(videoId);  // getDetails に修正
        console.log(`Successfully fetched video details for ID: ${videoId}`);

        res.json(video);
    } catch (error) {
        console.error("Error fetching video details:", error.message);
        console.error(error.stack);  // エラースタックを出力して、どこでエラーが発生したか追跡できるようにする
        res.status(500).json({ error: "動画情報の取得に失敗しました。" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});