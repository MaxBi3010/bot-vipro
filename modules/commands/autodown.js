module.exports.config = {
    name: "autodown",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Panna", // Hoàng Quyết
    description: "Tự động tải video từ link",
    commandCategory: "tiện ích",
    usages: "[on/off]",
    cooldowns: 5,
    envConfig: {
        status: true
    }
}; 
const API_ENDPOINT = "https://subhatde.id.vn";
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

function urlify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = [];
    let match;  
    while ((match = urlRegex.exec(text)) !== null) {
        urls.push(match[1]);
    } 
    return urls;
}
async function getStreamFromURL(url, type) {
    const response = await axios({
        method: "GET",
        url,
        responseType: "arraybuffer"
    });  
    const randomName = Math.random().toString(36).substring(2) + "." + type;
    const filePath = __dirname + `/cache/${randomName}`;    
    fs.writeFileSync(filePath, Buffer.from(response.data, "utf-8"));
    setTimeout(() => fs.unlinkSync(filePath), 60000);  
    return fs.createReadStream(filePath);
}
function getThreadStatus() {
    const statusFile = path.join(__dirname, "cache", "autodown.json");
    if (!fs.existsSync(statusFile)) {
        fs.writeFileSync(statusFile, JSON.stringify({}, null, 2));
        return {};
    }
    return JSON.parse(fs.readFileSync(statusFile, "utf8"));
}
function saveThreadStatus(threadStatus) {
    const statusFile = path.join(__dirname, "cache", "autodown.json");
    fs.writeFileSync(statusFile, JSON.stringify(threadStatus, null, 2));
}
module.exports.handleEvent = async function ({ api, event, client }) {
    const { threadID } = event;
    const threadStatus = getThreadStatus();
    if (threadStatus[threadID] === undefined) {
        threadStatus[threadID] = this.config.envConfig.status;
        saveThreadStatus(threadStatus);
    }
    if (!threadStatus[threadID]) return;    
    if (event.senderID == (global.botID || api.getCurrentUserID())) return;
    const urls = urlify(event.body); 
    for (const url of urls) {
        try {
            if (/^https?:\/\/(?:vm\.|vt\.|v\.|www\.)?(?:tiktok)\.com\//.test(url)) {
                const { data } = await axios.post(`https://www.tikwm.com/api/`, {
                    url: url // Fixed: using url instead of el
                });
                
                if (data.data) {
                    const tiktokData = data.data;
                    const msg = {
                        body: `[ AUTODOWN TIKTOK ]\n──────────────────\n⩺  Tiêu Đề: ${tiktokData.title}\n\n|📻  ${tiktokData.author.nickname} |🌍 ${tiktokData.region}|📶 ${tiktokData.music_info.duration}|❤ ${tiktokData.digg_count}|💬 ${tiktokData.comment_count}|🔄 ${tiktokData.share_count}|📲 ${tiktokData.download_count} \n⩺  Thả cảm xúc "❤" để tải music`,
                        attachment: []
                    };

         
                    if (tiktokData.images) {
                        msg.attachment = await Promise.all(
                            tiktokData.images.map(img => getStreamFromURL(img, 'jpg'))
                        );
                    } else {
                        msg.attachment = [await getStreamFromURL(tiktokData.play, 'mp4')];
                    }

                    const sent = await api.sendMessage(msg, event.threadID);
                    
                    
                    global.client.handleReaction.push({
                        name: this.config.name,
                        messageID: sent.messageID,
                        url_audio: tiktokData.music,
                        author: event.senderID 
                    });
                }
            } else if (/facebook\.com|fb\.watch|facebook\.com\/share\//.test(url)) {
(async () => {
    const result = await global.fb.dl(url); 
    const { media, title, likes, author, comments } = result;

    api.sendMessage({
        body: `[ AUTODOWN FACEBOOK ]\n──────────────── \n⩺ Tiêu đề: ${title || "Không có tiêu đề"}  
\n❤ ${likes || "Không có "} | 👤 ${author || "Không có "} | 💬 ${comments || "Không có"}  `,
        attachment: media,
    }, event.threadID, event.messageID);
})();
    }  else if (/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([^\/?#&]+)/.test(url)) {
                const response = await axios.get(`${API_ENDPOINT}/instagram/download?link=${encodeURIComponent(url)}`);
                const data = response.data;               
                if (data && data.attachments) {
                    let msg = {
                        body: `[ AUTODOWN - INSTAGRAM ]\n────────────────\n⩺ Tiêu đề: ${data.caption || ""}\n⩺ Tác giả: ${data.owner.full_name} (${data.owner.username})\n⩺ Lượt thích: ${data.like_count}\n⩺ Bình luận: ${data.comment_count}`,
                        attachment: []
                    };
                    if (data.media_type === 2) {
                        const videoAttachment = data.attachments.find(att => att.type === "Video");
                        if (videoAttachment) {
                            msg.attachment = [await getStreamFromURL(videoAttachment.url, "mp4")];
                        }
                    } else {
                        const photoAttachments = data.attachments.filter(att => att.type === "Photo");
                        if (photoAttachments.length > 0) {
                            msg.body += `\n⩺ Số lượng ảnh: ${photoAttachments.length}`;
                            msg.attachment = await Promise.all(
                                photoAttachments.map(att => getStreamFromURL(att.url, "jpg"))
                            );
                        }
                    }
                    await api.sendMessage(msg, event.threadID);
                }
            } else if (/(?:https?:\/\/)?(?:(?:www\.|on\.)?soundcloud\.com\/[^\/]+\/[^\/]+|on\.soundcloud\.com\/[a-zA-Z0-9]+)/.test(url)) {
                const response = await axios.get(`${API_ENDPOINT}/scl/download?url=${encodeURIComponent(url)}`);
                const data = response.data;            
                if (data && data.attachments) {
                    let msg = {
                        body: `[ AUTODOWN - SOUNDCLOUD ]\n────────────────\n⩺ Tiêu đề: ${data.title || ""}\n⩺ Tác giả: ${data.author || ""}\n⩺ Lượt phát: ${data.playback}\n⩺ Lượt thích: ${data.likes}\n⩺ Bình luận: ${data.comment}\n⩺ Chia sẻ: ${data.share}\n⩺ Thời lượng: ${data.duration}\n⩺ Đăng lúc: ${data.create_at}`,
                        attachment: []
                    };
                    const audioAttachment = data.attachments.find(att => att.type === "Audio");
                    if (audioAttachment && audioAttachment.url) {
                        msg.attachment = [await getStreamFromURL(audioAttachment.url, "mp3")];
                        await api.sendMessage(msg, event.threadID);
                    }
                }
            } else if (/(?:https?:\/\/)?(?:www\.)?capcut\.com\/t\/([a-zA-Z0-9]+)/.test(url)) {
    try {
        const chosenVideo = await global.capcut.downloadv2(url);

        if (!chosenVideo || !chosenVideo.video_url) {
            return;
        }

        const attachment = await global.tools.streamURL(chosenVideo.video_url, 'mp4');
        const threadID = event.threadID; // Lấy threadID từ sự kiện

        api.sendMessage({
            body: `[ AUTODOWN - CAPCUT ] \n─────────────── \n⩺ Tiêu đề: ${chosenVideo.short_title} ${chosenVideo.title}\n\n👤 ${chosenVideo.author.name} (${chosenVideo.author.unique_id})|📻 ${chosenVideo.fragment_count} | 📶 ${chosenVideo.usage_amount}|👁️ ${chosenVideo.play_amount}|❤ ${chosenVideo.like_count}|💬 ${chosenVideo.comment_count}| 🔄 ${chosenVideo.favorite_count}`,
            attachment: attachment
        }, threadID, (err) => {
            if (err) {
                console.error('Lỗi khi gửi tin nhắn:', err);
            }
        });
    } catch (error) {
        console.error('Error sending CapCut video message:', error);
    }
}else if (/(?:https?:\/\/)?(?:www\.)?threads\.net\/(?:@[^\/]+\/)?(?:post\/)?([^\/?]+)/.test(url)) {
                const response = await axios.get(`${API_ENDPOINT}/threads/download?url=${encodeURIComponent(url)}`);
                const data = response.data;            
                if (data && data.attachments && data.attachments.length > 0) {
                    let msg = {
                        body: `[ AUTODOWN - THREADS ]\n────────────────\n⩺ Nội dung: ${data.caption || ""}\n⩺ Tác giả: ${data.author || ""}`,
                        attachment: []
                    };
                    const mediaStreams = await Promise.all(
                        data.attachments.map(att => {
                            const fileType = att.type.toLowerCase() === "video" ? "mp4" : "jpg";
                            return getStreamFromURL(att.url, fileType);
                        })
                    );
                    msg.attachment = mediaStreams;
                    await api.sendMessage(msg, event.threadID);
                }
            } 
            else if (/^(?:https?:\/\/)?(?:www\.)?weibo\.com\/[0-9]+\/[0-9]+/.test(url)) {
    try {
        const mediaData = await global.j2.dlj2(url); // Lấy dữ liệu từ dlj2

        if (mediaData && mediaData.medias && Array.isArray(mediaData.medias) && mediaData.medias.length > 0) {
            let msg = {
                body: `[ AUTODOWN - WEIBO ]\n────────────────\n⩺ Tiêu đề: ${mediaData.title || ""}\n⩺ Nguồn: ${mediaData.source || "Weibo"}`,
                attachment: []
            };

            // Tải tất cả ảnh từ mảng medias
            for (const media of mediaData.medias) {
                if (media.type === "image" && media.url) {
                    const attachment = await global.tools.streamURL(media.url, media.extension || "jpg");
                    msg.attachment.push(attachment);
                }
            }

            // Kiểm tra nếu có media để gửi
            if (msg.attachment.length > 0) {
                await api.sendMessage(msg, event.threadID);
            } else {
                console.log("❌ Không có media nào để tải.");
            }
        } else {
            console.log("❌ Không thể tải dữ liệu từ URL hoặc không có media.");
        }
    } catch (error) {
        console.log(`❌ Lỗi khi xử lý yêu cầu: ${error.message}`);
    }
}else if (/^(?:https?:\/\/)?(?:www\.)?reddit\.com\/r\/[a-zA-Z0-9_]+\/comments\/[a-zA-Z0-9_]+/.test(url)) {
    try {
        const mediaData = await global.j2.dlj2(url); // Lấy dữ liệu từ dlj2

        if (mediaData && mediaData.medias && Array.isArray(mediaData.medias) && mediaData.medias.length > 0) {
            let msg = {
                body: `[ AUTODOWN - REDDIT ]\n────────────────\n⩺ Tiêu đề: ${mediaData.title || ""}\n⩺ Nguồn: Reddit`,
                attachment: []
            };

            // Tải tất cả ảnh từ mảng medias
            for (const media of mediaData.medias) {
                if (media.type === "image" && media.url) {
                    const attachment = await global.tools.streamURL(media.url, media.extension || "jpg");
                    msg.attachment.push(attachment);
                }
            }

            // Kiểm tra nếu có media để gửi
            if (msg.attachment.length > 0) {
                await api.sendMessage(msg, event.threadID);
            } else {
                console.log("❌ Không có media nào để tải.");
            }
        } else {
            console.log("❌ Không thể tải dữ liệu từ URL hoặc không có media.");
        }
    } catch (error) {
        console.log(`❌ Lỗi khi xử lý yêu cầu: ${error.message}`);
    }
} else if (/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/.test(url)) {
                const response = await axios.get(`${API_ENDPOINT}/youtube/download?url=${encodeURIComponent(url)}`);
                const data = response.data;            
                if (data && data.videoUrl) {
                    let msg = {
                        body: `[ AUTODOWN - YOUTUBE ]\n────────────────\n⩺ Tiêu đề: ${data.title || ""}\n⩺ Tác giả: ${data.author || ""}\n⩺ Thời lượng: ${data.duration}\n⩺ ID: ${data.id}`,
                        attachment: []
                    };                
                    msg.attachment = [await getStreamFromURL(data.videoUrl, "mp4")];
                    await api.sendMessage(msg, event.threadID);
                }
            } else if (/(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[^\/]+\/status\/\d+/.test(url)) {
                const response = await axios.get(`${API_ENDPOINT}/tw/download?url=${encodeURIComponent(url)}`);
                const data = response.data;
                let msg = {
                    body: `[ AUTODOWN - TWITTER ]\n────────────────\n⩺ Nội dung: ${data.title || ""}\n⩺ Tác giả: ${data.author || ""} ${data.username ? `(@${data.username})` : ""}\n⩺ Thời gian: ${data.date || ""}\n⩺ Lượt thích: ${data.likes || 0}\n⩺ Bình luận: ${data.replies || 0}\n⩺ Retweet: ${data.retweets || 0}`,
                    attachment: []
                };
                const mediaStreams = await Promise.all(
                    data.media.map(async (mediaUrl) => {
                        const fileType = data.type === "video" ? "mp4" : "jpg";
                        return await getStreamFromURL(mediaUrl, fileType);
                    })
                );
                msg.attachment = mediaStreams;
                await api.sendMessage(msg, event.threadID);
            } else if (/(?:https?:\/\/)?(?:www\.)?zingmp3\.vn\/[^\/]+\/[^\/]+/.test(url)) {
                const response = await axios.get(`${API_ENDPOINT}/zingmp3?link=${encodeURIComponent(url)}`);
                const data = response.data;
                let msg = {
                    body: `[ AUTODOWN - ZINGMP3 ]\n────────────────\n⩺ Bài hát: ${data.title || ""}\n⩺ Ca sĩ: ${data.artist || ""}`,
                    attachment: []
                };
                msg.attachment = [await getStreamFromURL(data.download_url, "mp3")];
                await api.sendMessage(msg, event.threadID);
            } else if (/(?:https?:\/\/)?(?:www\.)?v\.douyin\.com\/[a-zA-Z0-9]+/.test(url)) {
                const response = await axios.get(`${API_ENDPOINT}/tiktok/douyindl?url=${encodeURIComponent(url)}`);
                const data = response.data;
                let msg = {
                    body: `[ AUTODOWN - DOUYIN ]\n────────────────\n⩺ ID: ${data.id || ""}\n⩺ Nội dung: ${data.caption || ""}`,
                    attachment: []
                };
                const mediaStreams = await Promise.all(
                    data.attachments.map(async (att) => {
                        const fileType = att.type.toLowerCase() === "video" ? "mp4" : "jpg";
                        return await getStreamFromURL(att.url, fileType);
                    })
                );
                msg.attachment = mediaStreams;
                await api.sendMessage(msg, event.threadID);
            } else if (/(?:https?:\/\/)?(?:(?:www\.)?xiaohongshu\.com\/explore\/[a-zA-Z0-9]+|(?:www\.)?xhslink\.com\/[a-zA-Z0-9]+)/.test(url)) {
                const response = await axios.get(`${API_ENDPOINT}/fb/download?url=${encodeURIComponent(url)}`);
                const data = response.data;
                let msg = {
                    body: `[ AUTODOWN - XIAOHONGSHU ]\n────────────────\n⩺ Tiêu đề: ${data.title || ""}\n⩺ Số lượng: ${data.medias.length} ${data.medias[0].type}${data.medias.length > 1 ? "s" : ""}`,
                    attachment: []
                };
                const mediaStreams = await Promise.all(
                    data.medias.map(async (media) => {
                        if (!media || !media.url) throw new Error("URL media không hợp lệ");
                        return await getStreamFromURL(media.url, media.extension);
                    }));
                msg.attachment = mediaStreams;
                await api.sendMessage(msg, event.threadID);
            } else if (/(?:https?:\/\/)?(?:open\.)?spotify\.com\/(?:track|album)\/([a-zA-Z0-9]+)/.test(url)) {
                const response = await axios.get(`${API_ENDPOINT}/fb/download?url=${encodeURIComponent(url)}`);
                const data = response.data;              
                let msg = {
                    body: `[ AUTODOWN - SPOTIFY ]\n────────────────\n⩺ Bài hát: ${data.title || ""}\n⩺ Thời lượng: ${data.duration || ""}\n⩺ Chất lượng: ${data.medias[0].quality || ""}`,
                    attachment: []
                };
                msg.attachment = [await getStreamFromURL(data.medias[0].url, "mp3")];
                await api.sendMessage(msg, event.threadID);
            }
        } catch (error) {}
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID } = event;
    const command = args[0]?.toLowerCase();
    const threadStatus = getThreadStatus();
    if (threadStatus[threadID] === undefined) {
        threadStatus[threadID] = this.config.envConfig.status;
        saveThreadStatus(threadStatus);
    }    
    if (command === "on" || command === "off") {
        threadStatus[threadID] = command === "on";
        saveThreadStatus(threadStatus);
        return api.sendMessage(
            `✅ Đã ${command === "on" ? "bật" : "tắt"} chức năng tự động tải xuống cho nhóm này.\n` +
            `⚙️ Trạng thái hiện tại: ${command === "on" ? "Đang bật" : "Đã tắt"}`,
            threadID
        );
    }
    if (!args[0]) {
        return api.sendMessage(
            "📝 Hướng dẫn sử dụng:\n" +
            "⭐ autodown on: Bật tự động tải xuống\n" +
            "⭐ autodown off: Tắt tự động tải xuống\n" +
            `⚙️ Trạng thái hiện tại: ${threadStatus[threadID] ? "Đang bật" : "Đã tắt"}`,
            threadID
        );
    }
    try {
        await module.exports.handleEvent({ api, event });
    } catch (error) {
        api.sendMessage(`❌ Lỗi: ${error.message}`, threadID);
    }
};

module.exports.handleReaction = async function({ api, event, handleReaction }) {
    try {
        if (event.userID != handleReaction.author) return;
        
        const msg = {
            body: `\n⩺  Music Downloaded `,
            attachment: await getStreamFromURL(handleReaction.url_audio, 'mp3')
        };
        
        return api.sendMessage(msg, event.threadID, null, event.messageID);
    } catch (error) {
        return api.sendMessage(
            `❌ Error downloading music: ${error.message}`, 
            event.threadID, 
            null, 
            event.messageID
        );
    }
};

