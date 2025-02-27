const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
    name: "spt",
    version: "2.1.0",
    hasPermssion: 0,
    credits: "Tain",
    description: "Tìm kiếm bài hát, lấy thông tin bài hát và tải xuống từ Spotify",
    commandCategory: "media",
    usages: "[search/info/download] [query/URL]",
    cooldowns: 2
};

// Kiểm tra và khởi tạo global.spt nếu chưa có
if (!global.spt) {
    global.spt = {
        searching: null,
        spotifydl: null
    };
}

const { searching, spotifydl } = global.spt;

// Nếu thiếu hàm nào, log lỗi và thoát mà không throw
if (typeof searching !== "function" || typeof spotifydl !== "function") {
    console.error("❌ Các hàm searching và spotifydl chưa được định nghĩa trong global.spt.");
    module.exports.run = async ({ event, api }) => {
        return api.sendMessage("⚠️ Chức năng chưa sẵn sàng. Vui lòng thử lại sau!", event.threadID);
    };
    return;
}

const spRegex = /https?:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/;

const dl = async (url, dest) => {
    try {
        const res = await axios.get(url, { responseType: "stream" });
        const writer = fs.createWriteStream(dest);
        res.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });
    } catch (err) {
        console.error("❌ Lỗi tải file:", err);
        throw err;
    }
};

exports.run = async ({ event, api, args }) => {
    const q = args.join(" ");
    const { threadID, messageID, senderID } = event;

    if (!q) {
        return api.sendMessage("⚠️ Vui lòng nhập tên bài hát hoặc link Spotify!", threadID, messageID);
    }

    const isSpotifyLink = spRegex.test(q);

    if (isSpotifyLink) {
        try {
            const songInfo = await spotifydl(q);
            if (!songInfo || !songInfo.download) {
                return api.sendMessage("❌ Link nhạc không hợp lệ hoặc không hỗ trợ!", threadID, messageID);
            }

            const audioPath = path.resolve(__dirname, `./cache/spt_${senderID}.mp3`);
            await dl(songInfo.download, audioPath);

            const msg = `🎵 Tải nhạc thành công:\n- Tiêu đề: ${songInfo.title || "Không rõ"}\n- Nghệ sĩ: ${songInfo.artist || "Không rõ"}\n- Thời gian: ${songInfo.durasi ? Math.floor(songInfo.durasi / 1000) + "s" : "Không rõ"}\n🔗 Link tải: ${songInfo.download}`;

            return api.sendMessage(
                { body: msg, attachment: fs.createReadStream(audioPath) },
                threadID,
                () => fs.unlinkSync(audioPath),
                messageID
            );
        } catch (e) {
            console.error("❌ Lỗi tải nhạc:", e);
            return api.sendMessage("❌ Đã xảy ra lỗi khi tải nhạc", threadID, messageID);
        }
    } else {
        try {
            const searchResult = await searching(q);
            if (!searchResult || !searchResult.status) {
                return api.sendMessage(searchResult.msg || "❌ Không tìm thấy bài hát!", threadID, messageID);
            }

            let msg = "🔍 Kết quả tìm kiếm:\n";
            const links = [];

            searchResult.data.forEach((item, i) => {
                msg += `${i + 1}. ${item.title} (${item.duration})\n`;
                links.push(item.url);
            });

            msg += "➡️ Trả lời tin nhắn với số thứ tự để tải nhạc";

            return api.sendMessage(msg, threadID, (err, info) => {
                if (err) return console.error(err);
                global.client.handleReply.push({
                    name: this.config.name,
                    author: senderID,
                    messageID: info.messageID,
                    links
                });
            });
        } catch (e) {
            console.error("❌ Lỗi tìm kiếm:", e);
            return api.sendMessage("❌ Đã xảy ra lỗi khi tìm kiếm", threadID, messageID);
        }
    }
};

exports.handleReply = async ({ event, api, handleReply }) => {
    const { body, senderID, threadID, messageID } = event;
    api.unsendMessage(handleReply.messageID);

    if (senderID !== handleReply.author) return;

    const index = parseInt(body) - 1;
    const links = handleReply.links;

    if (isNaN(index) || index < 0 || index >= links.length) {
        return api.sendMessage("❌ Vui lòng chọn một số hợp lệ", threadID, messageID);
    }

    try {
        const link = links[index];
        const songInfo = await spotifydl(link);
        if (!songInfo || !songInfo.download) {
            return api.sendMessage("❌ Không thể tải bài hát này!", threadID, messageID);
        }

        const audioPath = path.resolve(__dirname, `./cache/spt_${senderID}.mp3`);
        await dl(songInfo.download, audioPath);

        const msg = `🎵 Tải nhạc thành công:\n- Tiêu đề: ${songInfo.title || "Không rõ"}\n- Nghệ sĩ: ${songInfo.artist || "Không rõ"}\n- Thời gian: ${songInfo.durasi ? Math.floor(songInfo.durasi / 1000) + "s" : "Không rõ"}\n🔗 Link nhạc: ${link}`;

        return api.sendMessage(
            { body: msg, attachment: fs.createReadStream(audioPath) },
            threadID,
            () => fs.unlinkSync(audioPath),
            messageID
        );
    } catch (e) {
        console.error("❌ Lỗi tải nhạc:", e);
        return api.sendMessage("❌ Đã xảy ra lỗi khi tải nhạc", threadID, messageID);
    }
};