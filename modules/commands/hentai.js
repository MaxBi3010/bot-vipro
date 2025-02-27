const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "hentai",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "dgk",
    description: "Tải video hentai ngẫu nhiên",
    commandCategory: "Quản trị viên",
    usages: "",
    cooldowns: 0,
    dependencies: {}
};

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID } = event;

    // Hàm tải video hentai ngẫu nhiên từ API và lưu vào cache
    const downloadVideo = async (videoUrl) => {
        try {
            const filePath = path.join(__dirname, 'cache', 'video.mp4'); // Đặt đường dẫn lưu file video trong thư mục cache

            // Tải video và lưu vào file
            const writer = fs.createWriteStream(filePath);
            const response = await axios.get(videoUrl, { responseType: 'stream' });

            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(filePath));  // Khi tải xong, trả về đường dẫn file
                writer.on('error', reject);  // Nếu có lỗi thì reject
            });
        } catch (error) {
            console.error('Lỗi khi tải video:', error);
            return null;
        }
    };

    // Hàm lấy video hentai ngẫu nhiên từ API
    const getRandomHentaiVideo = async () => {
        try {
            const response = await axios.get('https://joshweb.click/api/randhntai');
            const data = response.data.result;
            const randomVideo = data[Math.floor(Math.random() * data.length)];

            return {
                title: randomVideo.title,
                videoUrl: randomVideo.video_1 // Sử dụng video_1 là liên kết chính
            };
        } catch (error) {
            console.error('Lỗi khi tải video hentai:', error);
            return null;
        }
    };

    // Lấy video ngẫu nhiên từ API
    try {
        const videoDetails = await getRandomHentaiVideo();
        if (videoDetails) {
            // Tải video và lưu vào cache
            const filePath = await downloadVideo(videoDetails.videoUrl);
            if (filePath) {
                // Gửi video từ cache
                const message = await api.sendMessage({
                    body: `🎬 **Video ngẫu nhiên**: ${videoDetails.title}`,
                    attachment: fs.createReadStream(filePath)
                }, threadID, messageID);

                // Đặt thời gian thu hồi tin nhắn sau 5 phút (300,000ms)
                setTimeout(() => {
                    api.unsendMessage(message.messageID); // Thu hồi tin nhắn đã gửi
                    console.log('Tin nhắn đã bị thu hồi sau 5 phút.');
                }, 300000); // 300,000ms = 5 phút

            } else {
                return api.sendMessage("❎ Không thể tải video, vui lòng thử lại sau.", threadID, messageID);
            }
        } else {
            return api.sendMessage("❎ Không thể lấy video ngẫu nhiên, vui lòng thử lại sau.", threadID, messageID);
        }
    } catch (error) {
        console.error('Lỗi trong quá trình xử lý:', error);
        return api.sendMessage("❎ Đã xảy ra lỗi khi lấy video. Vui lòng thử lại sau.", threadID, messageID);
    }
};