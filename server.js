const express = require("express");
const { Innertube } = require("youtubei.js");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

let yt;

// 初期化処理（エラー時は詳細をログに出す）
(async () => {
    try {
        yt = await Innertube.create();
        console.log("YouTube API initialized successfully.");
        console.log("Available methods on yt:", Object.keys(yt));
    } catch (error) {
        console.error("Error initializing YouTube API:", error);
    }
})();

// 動画情報取得APIエンドポイント
app.get("/video", async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        console.error("Error: Video ID is missing.");
        return res.status(400).json({ error: "動画IDが必要です" });
    }
    
    if (!yt) {
        console.error("YouTube API has not been initialized yet.");
        return res.status(500).json({ error: "YouTube APIの初期化が完了していません。" });
    }

    try {
        console.log(`Fetching details for video ID: ${videoId}`);
        let video;

        // 利用可能なメソッドをチェックして動画情報を取得
        if (typeof yt.getDetails === "function") {
            video = await yt.getDetails(videoId);
        } else if (typeof yt.getVideo === "function") {
            video = await yt.getVideo(videoId);
        } else if (typeof yt.getInfo === "function") {
            video = await yt.getInfo(videoId);
        } else {
            throw new Error("動画情報を取得するためのメソッドが存在しません。");
        }

        console.log(`Successfully fetched video details for ID: ${videoId}`);
        res.json(video);
    } catch (error) {
        console.error("Error fetching video details:", error.message);
        console.error(error.stack);
        res.status(500).json({ error: "動画情報の取得に失敗しました。" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
