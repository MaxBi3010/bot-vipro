const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "emix",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Modified by dgk",
    description: "Mix two emojis together using Tenor API",
    commandCategory: "Người dùng",
    usages: "[emoji1 emoji2]",
    usePrefix: true,
    cooldowns: 2,
    dependencies: {}
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    
    if (args.length < 2) {
        return api.sendMessage("⚠️ Vui lòng nhập 2 emoji cách nhau bằng dấu cách: [emoji1 emoji2]", threadID, messageID);
    }
    const [emoji1, emoji2] = args;

    try {
        
        const apiKey = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ"; // Sử dụng .env để bảo mật tốt hơn
        const apiUrl = `https://tenor.googleapis.com/v2/featured?key=${apiKey}&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;

        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.results || !data.results[0] || !data.results[0].media_formats.png_transparent.url) {
            return api.sendMessage("❌ Không tìm thấy kết quả cho cặp emoji này!", threadID, messageID);
        }

        const emojiUrl = data.results[0].media_formats.png_transparent.url;

        
        const imagePath = path.join(__dirname, 'cache', 'emoji_mix.png');
        const imageResponse = await axios.get(emojiUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(imagePath, Buffer.from(imageResponse.data));

       
        return api.sendMessage({ body: "✨ Emoji Mix:", attachment: fs.createReadStream(imagePath) }, threadID, messageID);
    } catch (error) {
        console.error(error);
        return api.sendMessage("❌ Đã xảy ra lỗi trong quá trình mix emoji.", threadID, messageID);
    }
};
