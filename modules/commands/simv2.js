const fs = require('fs-extra');
const path = require('path');
const ytdl = require('@distube/ytdl-core');
const Youtube = require('youtube-search-api');
const { createReadStream, unlinkSync } = require("fs-extra");



module.exports.config = {
    name: "000",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Panna",
    description: "Test chức năng chat AI",
    commandCategory: "AI",
    usages: "on/off hoặc gọi bot để chat",
    cooldowns: 3,
    hasPrefix: true,
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID } = event;
    const mode = args[0]?.toLowerCase();
    const testMode = loadTestMode();

    switch (mode) {
        case 'on':
            testMode[threadID] = true;
            saveTestMode(testMode);
            api.sendMessage("✅ Đã bật chế độ chat với bot! Hãy gọi 'bot' để bắt đầu chat", threadID);
            break;

        case 'off':
            testMode[threadID] = false;
            saveTestMode(testMode);
            api.sendMessage("❎ Đã tắt chế độ chat với bot", threadID);
            break;

        default:
            api.sendMessage("⚠️ Vui lòng sử dụng on/off để bật/tắt chế độ chat", threadID);
    }
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, body, senderID } = event;
    const testMode = loadTestMode();

    if (!testMode[threadID]) return;

    if (body?.toLowerCase().includes('bot')) {
        try {
            const result = await global.cc.downloadv1(body.replace(/bot/gi, '').trim());
            if (!result) return;

            if (result.loại === 'send') {
                api.sendMessage(result.nội_dung, threadID, (err, info) => {
                    if (!err) {
                        global.client.handleReply.push({
                            name: this.config.name,
                            messageID: info.messageID,
                            author: senderID,
                            type: "test"
                        });
                    }
                });

                if (result.delay) {
                    await new Promise(resolve => setTimeout(resolve, result.delay));
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
        }
    }

    // Tìm nhạc khi có từ khóa "nhạc" hoặc "bài hát"
    if (body.toLowerCase().includes("nhạc") || body.toLowerCase().includes("bài hát")) {
        const keywordSearch = body.toLowerCase().split(/nhạc|bài hát/i)[1]?.trim();
        if (!keywordSearch) {
            api.sendMessage("❌ Bạn chưa cung cấp tên bài hát. Vui lòng thử lại.", threadID);
            return;
        }

        const path = `${__dirname}/cache/sing-${senderID}.mp3`;
        if (fs.existsSync(path)) fs.unlinkSync(path);

        try {
            const results = (await Youtube.GetListByKeyword(keywordSearch, false, 1)).items;

            if (results.length === 0) {
                api.sendMessage("❌ Không tìm thấy bài hát nào phù hợp.", threadID);
                return;
            }

            const videoID = results[0].id;
            const data = await getdl(`https://www.youtube.com/watch?v=${videoID}`, path);

            if (fs.statSync(path).size > 26214400) {
                api.sendMessage("❌ Đã xảy ra lỗi khi tải nhạc. Tệp nhạc quá lớn.", threadID);
                fs.unlinkSync(path);
                return;
            }

            api.sendMessage({
                body: `🎵 Nhạc của bạn đây`,
                attachment: fs.createReadStream(path),
            }, threadID, () => {
                fs.unlinkSync(path);
            });
        } catch (err) {
            console.error("Error processing music:", err);
            api.sendMessage("❌ Lỗi khi xử lý nhạc. Vui lòng thử lại sau.", threadID);
        }
    }
};

async function getdl(link, path) {
    const timestart = Date.now();
    if (!link) return "Thiếu link";
    return new Promise((resolve, reject) => {
        ytdl(link, {
            filter: format => format.quality === 'tiny' && format.audioBitrate === 128 && format.hasAudio === true,
        })
            .pipe(fs.createWriteStream(path))
            .on("close", async () => {
                const data = await ytdl.getInfo(link);
                resolve({
                    title: data.videoDetails.title,
                    dur: Number(data.videoDetails.lengthSeconds),
                    viewCount: data.videoDetails.viewCount,
                    likes: data.videoDetails.likes,
                    uploadDate: data.videoDetails.uploadDate,
                    sub: data.videoDetails.author.subscriber_count,
                    author: data.videoDetails.author.name,
                    timestart,
                });
            })
            .on("error", reject);
    });
}

function convertHMS(value) {
    const sec = parseInt(value, 10);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    return (hours !== "00" ? hours + ":" : "") + minutes + ":" + seconds;
}

function getTestModePath() {
    return path.join(process.cwd(), 'modules', 'commands', 'data', 'testMode.json');
}

function loadTestMode() {
    const testModePath = getTestModePath();
    if (!fs.existsSync(testModePath)) {
        fs.writeFileSync(testModePath, JSON.stringify({}));
        return {};
    }
    return JSON.parse(fs.readFileSync(testModePath));
}

function saveTestMode(data) {
    const testModePath = getTestModePath();
    fs.writeFileSync(testModePath, JSON.stringify(data, null, 2));
}
