const express = require("express");
const { Innertube } = require("youtubei.js");
const cors = require("cors");

const app = express();
app.use(cors());

let yt;

// YouTube API 初期化
(async () => {
    try {
        yt = new Innertube();  // バージョン 1.4.5 に対応
        console.log("✅ YouTube API initialized successfully.");
    } catch (error) {
        console.error("❌ Error initializing YouTube API:", error);
    }
})();

// 動画情報を取得するAPI
app.get("/video", async (req, res) => {
    const videoId = req.query.id;

    if (!videoId) {
        console.error("❌ Error: Video ID is missing.");
        return res.status(400).json({ error: "動画IDが必要です" });
    }

    if (!yt) {
        console.error("🚨 YouTube API has not been initialized yet.");
        return res.status(500).json({ error: "YouTube APIの初期化が完了していません。" });
    }

    try {
        console.log(`🔍 Fetching details for video ID: ${videoId}`);
        const video = await yt.getBasicInfo(videoId); // getVideo() → getBasicInfo() に変更
        console.log(`✅ Successfully fetched video details for ID: ${videoId}`);
        res.json(video);
    } catch (error) {
        console.error("❌ Error fetching video details:", error);
        res.status(500).json({ error: "動画情報の取得に失敗しました。" });
    }
});

// ポート8080でサーバーを起動
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
