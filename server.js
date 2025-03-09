const express = require("express");
const { Innertube } = require("youtubei.js");
const cors = require("cors");

const app = express();
const DEFAULT_PORT = process.env.PORT || 10000;

app.use(cors());

let yt;

// ✅ `Innertube.create()` で初期化
(async () => {
    try {
        yt = await Innertube.create();  // new Innertube() はダメ
        console.log("✅ YouTube API initialized successfully.");
    } catch (error) {
        console.error("❌ Error initializing YouTube API:", error);
    }
})();

// 動画情報を取得するAPI
app.get("/video", async (req, res) => {
    if (!yt) {
        console.error("🚨 YouTube API has not been initialized yet.");
        return res.status(500).json({ error: "YouTube APIの初期化が完了していません。" });
    }

    const videoId = req.query.id;
    if (!videoId) {
        console.error("⚠️ Error: Video ID is missing.");
        return res.status(400).json({ error: "動画IDが必要です" });
    }

    try {
        console.log(`🎥 Fetching details for video ID: ${videoId}`);
        const video = await yt.getDetails(videoId);
        console.log(`✅ Successfully fetched video details for ID: ${videoId}`);

        res.json(video);
    } catch (error) {
        console.error("❌ Error fetching video details:", error.message);
        console.error(error.stack);
        res.status(500).json({ error: "動画情報の取得に失敗しました。" });
    }
});

// サーバー起動 & ポート自動変更
const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
    });

    server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
            console.error(`⚠️ Port ${port} is already in use. Trying another port...`);
            setTimeout(() => {
                startServer(0); // OS に空いているポートを選ばせる
            }, 1000);
        } else {
            console.error("❌ Server error:", error);
        }
    });
};

// 初回起動
startServer(DEFAULT_PORT);
