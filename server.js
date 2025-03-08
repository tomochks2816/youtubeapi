const express = require('express');
const { Innertube } = require('youtubei.js');

const app = express();
const PORT = process.env.PORT || 3000;

// 数字をカンマ区切りにフォーマット
const formatCount = (count) => count ? count.toLocaleString() : '0';

// 秒を hh:mm:ss に変換
const formatDuration = (seconds) => {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].filter((v, i) => v > 0 || i > 0).map(v => String(v).padStart(2, '0')).join(':');
};

// YouTube動画情報取得API
app.get('/api/video/:id', async (req, res) => {
  try {
    const yt = await Innertube.create();
    const videoId = req.params.id;
    const videoInfo = await yt.getInfo(videoId);

    if (!videoInfo) {
      return res.status(404).json({ error: '動画が見つかりません' });
    }

    const data = {
      title: videoInfo.basic_info.title,
      viewCount: videoInfo.basic_info.view_count,
      viewCountText: `${formatCount(videoInfo.basic_info.view_count)}回`,
      likeCount: videoInfo.basic_info.likes,
      likeCountText: formatCount(videoInfo.basic_info.likes),
      description: videoInfo.basic_info.short_description,
      videoId: videoInfo.basic_info.id,
      channelName: videoInfo.basic_info.author.name,
      channelId: videoInfo.basic_info.author.id,
      channelThumbnails: videoInfo.basic_info.author.thumbnails,
      duration: formatDuration(videoInfo.basic_info.duration),
      recommendedVideos: videoInfo.related_videos?.map(v => ({
        videoId: v.id,
        title: v.title,
        viewCount: v.view_count,
        viewCountText: `${formatCount(v.view_count)}回`,
        publishedText: v.published,
        author: v.author?.name || null,
        authorId: v.author?.id || null,
        thumbnailUrl: v.thumbnails?.[v.thumbnails.length - 1]?.url || null,
        duration: formatDuration(v.duration?.seconds)
      })) || []
    };

    res.json(data);
  } catch (error) {
    console.error('エラー:', error);
    res.status(500).json({ error: 'データ取得中にエラーが発生しました' });
  }
});

app.listen(PORT, () => console.log(`サーバー起動！ http://localhost:${PORT}`));
