const axios = require('axios');
const instagram = require('./../../utils/ig.js')

module.exports.config = {
        name: "ig",
        version: "1.0.0",
        hasPermssion: 0,
        credits: "Panna",
        description: "Tìm kiếm và xem bài đăng Instagram",
        commandCategory: "Tiện ích",
        usages: "ig post <username> - Xem bài đăng của người dùng\nig search <từ khóa> - Tìm kiếm người dùng\nig reel - Xem reel ngẫu nhiên",
        cooldowns: 5,
        hasPrefix: true
    };

    module.exports.run = async function ({ api, event, msg, args }) {;
        const fs = require('fs');
        const path = require('path');
        
        if (!args[0]) return api.sendMessage("⚠️ Vui lòng sử dụng:\n• ig post <username>\n• ig search <từ khóa>\n• ig cookie <cookie> (chỉ admin)\n• ig reel - Xem reel ngẫu nhiên", event.threadID);
        
        const command = args[0].toLowerCase();
        const query = args.slice(1).join(" ");
        
        try {

            if (command === "reel") {
                const reels = await instagram.reel();
                if (!reels || !reels.clips || reels.clips.length === 0) {
                    return api.sendMessage("❌ Không tìm thấy reels nào", event.threadID);
                }
                const randomReel = reels.clips[Math.floor(Math.random() * reels.clips.length)];              
                let msgBody = `📱 Reel từ @${randomReel.user.username}\n─────────────────\n\n`;
                msgBody += `📝 Nội dung: ${randomReel.caption || "Không có chú thích"}\n\n`;
                msgBody += `👍 ${randomReel.likeCount} lượt thích\n`;
                msgBody += `💬 ${randomReel.commentCount} bình luận\n`;
                if (randomReel.hasAudio) msgBody += `🔊 Có âm thanh\n`;
                msgBody += "─────────────────";
                if (randomReel.video && randomReel.video.url) {
                    const stream = await axios({
                   url: randomReel.video.url,
                      method: 'GET',
                    responseType: 'stream'
                      }).then(response => response.data);

                     if (stream) {
                     return api.sendMessage({
                        body: msgBody,
                        attachment: stream
                        }, event.threadID);
                    } else {
                        return api.sendMessage(msgBody + "\n❌ Không thể tải video", event.threadID);
                    }
                } else {
                    return api.sendMessage(msgBody + "\n❌ Không tìm thấy video", event.threadID);
                }
            }            
            if (!query) return api.sendMessage("⚠️ Vui lòng nhập username hoặc từ khóa", event.threadID);           
            if (command === "post") {
                const posts = await instagram.post(query);
                if (!posts || !posts.length) return api.sendMessage("❌ Không tìm thấy bài đăng nào", event.threadID);
                let msg = `📱 Danh sách bài đăng của @${query}:\n─────────────────\n\n`;
                posts.forEach((post, index) => {
                    msg += `${index + 1}. ${post.caption ? post.caption.slice(0, 65) + (post.caption.length > 65 ? '...' : '') : 'Không có chú thích'}\n`;
                    msg += `👍 ${post.stats?.likes || 0} thích • 💬 ${post.stats?.comments || 0} bình luận\n─────────────────\n`;
                });
                msg += "\n👉 Phản hồi số thứ tự để xem bài đăng";
                
                return api.sendMessage(msg, event.threadID, (err, info) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: info.messageID,
                        author: event.senderID,
                        posts: posts,
                        type: "postList",
                        username: query
                    });
                });
            } else if (command === "search") {
                const results = await instagram.search(query);
                if (!results || !results.length) return api.sendMessage("❌ Không tìm thấy người dùng nào", event.threadID);
                
                let msg = `🔍 Kết quả tìm kiếm cho "${query}":\n─────────────────\n\n`;
                results.forEach((user, index) => {
                    msg += `${index + 1}. ${user.fullName}\n`;
                    msg += `👤 @${user.username}\n`;
                    if (user.isVerified) msg += "✓ Đã xác minh\n";
                    msg += "─────────────────\n";
                });
                msg += "\n👉 Phản hồi số thứ tự để xem bài đăng";
                
                return api.sendMessage(msg, event.threadID, (err, info) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: info.messageID,
                        author: event.senderID,
                        users: results,
                        type: "searchResult"
                    });
                });
            }
        } catch (error) {
            return api.sendMessage(`❌ Lỗi: ${error.message}`, event.threadID);
        }
    }

    module.exports.handleReply = async function ({ api, event, handleReply }) {
        const { type } = handleReply;

        try {
            if (type === "searchResult") {
                const { users, messageID } = handleReply;
                const userIndex = parseInt(event.body) - 1;
                
                if (isNaN(userIndex) || userIndex < 0 || userIndex >= users.length) {
                    return api.sendMessage("⚠️ Lựa chọn không hợp lệ", event.threadID);
                }

                await api.unsendMessage(messageID);
                const username = users[userIndex].username;
const url = `https://thanhquang.io.vn/instagram/post?q=${encodeURIComponent(username)}`;
const response = await axios.get(url);
const posts = response.data;
                
                if (!posts || !posts.length) {
                    return api.sendMessage("❌ Không tìm thấy bài đăng nào", event.threadID);
                }

                let msg = `📱 Danh sách bài đăng của @${users[userIndex].username}:\n─────────────────\n\n`;
                posts.forEach((post, index) => {
                    msg += `${index + 1}. ${post.caption ? post.caption.slice(0, 65) + (post.caption.length > 65 ? '...' : '') : 'Không có chú thích'}\n`;
                    msg += `👍 ${post.stats?.likes || 0} thích • 💬 ${post.stats?.comments || 0} bình luận\n─────────────────\n`;
                });
                msg += "\n👉 Phản hồi số thứ tự để xem bài đăng";
                
                return api.sendMessage(msg, event.threadID, (err, info) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: info.messageID,
                        author: event.senderID,
                        posts: posts,
                        type: "postList",
                        username: users[userIndex].username
                    });
                });
            } else if (type === "postList") {
                const { posts, username, messageID } = handleReply;
                const postIndex = parseInt(event.body) - 1;
                
                if (isNaN(postIndex) || postIndex < 0 || postIndex >= posts.length) {
                    return api.sendMessage("⚠️ Lựa chọn không hợp lệ", event.threadID);
                }

                await api.unsendMessage(messageID);
                const post = posts[postIndex];
                let msgBody = `📱 Bài đăng từ @${username}\n─────────────────\n\n`;
                msgBody += `📝 Nội dung: ${post.caption || "Không có chú thích"}\n\n`;
                msgBody += `👍 ${post.stats?.likes || 0} lượt thích\n`;
                msgBody += `💬 ${post.stats?.comments || 0} bình luận\n`;
                msgBody += "─────────────────";
                
                if (post.media && post.media.length > 0) {
                    const mediaUrls = post.media.map(m => m.url).filter(url => url && typeof url === 'string');
                    if (mediaUrls.length > 0) {
                        const streams = await Promise.all(mediaUrls.map(async url => {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        return response.data; 
    } catch (error) {
        console.error(`Error streaming URL ${url}:`, error);
        return null; 
    }
                        }));
                        await api.sendMessage({ 
                            body: msgBody, 
                            attachment: streams.filter(stream => stream) 
                        }, event.threadID);
                    } else {
                        await api.sendMessage(msgBody, event.threadID);
                    }
                } else {
                    await api.sendMessage(msgBody, event.threadID);
                }
            }
        } catch (error) {
            return api.sendMessage(`❌ Lỗi: ${error.message}`, event.threadID);
        }
    };