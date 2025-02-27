module.exports.config = {
    name: "randomtiktok",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "dgk",
    description: "Lấy video ngẫu nhiên từ TikTok",
    commandCategory: "Media",
    usages: "randomtiktok",
    cooldowns: 5,
};

const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
        
        const response = await axios.get("https://subhatde.id.vn/random/tiktok");
        const data = response.data;

        if (!data || !data.attachments || !data.attachments[0].url) {
            return api.sendMessage("❎ Không thể lấy dữ liệu video TikTok.", threadID, messageID);
        }

        
        const videoUrl = data.attachments[0].url;
        const videoPath = path.resolve(__dirname, "random_tiktok.mp4");
        const writer = fs.createWriteStream(videoPath);
        const videoStream = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream',
        });

        videoStream.data.pipe(writer);

        writer.on('finish', () => {
            
            const message = `\n\n` +
                `📝 Title: ${data.message}\n` +
                `👤 Author: ${data.author.name} (@${data.author.username})\n` +
                `📊 Stats:\n  - Views: ${data.stats.views}\n  - Likes: ${data.stats.likes}\n  - Comments: ${data.stats.comments}\n  - Shares: ${data.stats.shares}\n  - Collects: ${data.stats.collects}\n` +
                `🎵 Music: ${data.music.title} by ${data.music.author}\n` +
                `⏰ Created At: ${data.createTime}\n`;

            api.sendMessage({
                body: message,
                attachment: fs.createReadStream(videoPath)
            }, threadID, () => fs.unlinkSync(videoPath), messageID);
        });

        writer.on('error', () => {
            api.sendMessage("❎ Đã xảy ra lỗi khi tải video.", threadID, messageID);
        });
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return api.sendMessage("❎ Đã xảy ra lỗi khi lấy dữ liệu video TikTok.", threadID, messageID);
    }
};