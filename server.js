const express = require('express');
const { Innertube } = require('youtubei.js');

const app = express();
const PORT = process.env.PORT || 3000;

// 数字をカンマ区切りにフォーマットする関数
const formatCount = (count) => count ? count.toLocaleString() : '0';

// 秒を hh:mm:ss に変換する関数
const formatDuration = (seconds) => {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s]
    .filter((v, i) => v > 0 || i > 0)
    .map(v => String(v).padStart(2, '0'))
    .join(':');
};

// YouTube動画情報取得APIエンドポイント
app.get('/api/video/:id', async (req, res) => {
  try {
    const yt = await Innertube.create();
    const videoId = req.params.id;
    const videoInfo = await yt.getInfo(videoId);

    if (!videoInfo || !videoInfo.basic_info) {
      return res.status(404).json({ error: '動画情報が取得できませんでした' });
    }

    // 安全に値を取得するために optional chaining とデフォルト値を利用
    const basic = videoInfo.basic_info;
    const author = basic.author || {};

    const data = {
      title: basic.title || 'No title',
      viewCount: basic.view_count || 0,
      viewCountText: `${formatCount(basic.view_count)}回`,
      likeCount: basic.likes || 0,
      likeCountText: formatCount(basic.likes),
      description: basic.short_description || '',
      videoId: basic.id || videoId,
      channelName: author?.name || 'Unknown',
      channelId: author?.id || null,
      channelThumbnails: author?.thumbnails || [],
      duration: formatDuration(basic.duration),
      recommendedVideos: (videoInfo.related_videos || []).map(v => ({
        videoId: v.id || null,
        title: v.title || 'No title',
        viewCount: v.view_count || 0,
        viewCountText: `${formatCount(v.view_count)}回`,
        publishedText: v.published || '',
        author: v.author?.name || null,
        authorId: v.author?.id || null,
        thumbnailUrl: (v.thumbnails && v.thumbnails.length > 0) ? v.thumbnails[v.thumbnails.length - 1].url : null,
        duration: formatDuration(v.duration?.seconds)
      }))
    };

    res.json(data);
  } catch (error) {
    console.error('エラー:', error);
    // エラー内容を出力しつつ、ユーザーには一般的なエラーメッセージを返す
    res.status(500).json({ error: 'データ取得中にエラーが発生しました' });
  }
});

app.listen(PORT, () => console.log(`✅ APIサーバー起動！ http://localhost:${PORT}`));
