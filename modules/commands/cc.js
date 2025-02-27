const axios = require("axios");
const moment = require('moment-timezone');

exports.config = {
 name: 'cc',
 version: '1.1.1',
 hasPermssion: 0,
 credits: 'Panna',
 description: 'Thông tin từ nền tảng capcut',
 commandCategory: 'Tiện ích',
 cooldowns: 5,
 images: [],
};
exports.run = async function  ({ api, event, args }) {
    const { threadID: tid, messageID: mid, senderID: sid } = event;
    const argument = args.slice(1).join(" ");
    switch(args[0]) {
        case '-i':
        case 'info':
    const url = argument;
    if (!url) { 
        return api.sendMessage("Vui lòng cung cấp link profile của người tạo!", tid, mid);
    }
    try {
        const userData = await global.capcut.info(url);
        const user = userData.user;
        const userStatistics = userData.user_statistics;
        const vipInfo = userData.vip_info;
        const tabEntrance = userData.tab_entrance;
        
        const tiktokInfo = user.is_display_tiktok_profile ? `Bật` : "Tắt";
        const creatorLevel = user.creator_info.level_system_config === "use_v3" ? "V3" : "V2";

        const message = `╭─────────────⭓
│ Tên: ${user.name}
│ CapcutID: ${user.unique_id}
│ Uid: ${user.uid}
│ WebUid: ${user.web_uid}
│ PublicID: ${user.public_id}
│ Giới tính: ${user.gender === 1 ? "Nam" : user.gender === 2 ? "Nữ" : "Không xác định"}
│ Mô tả: ${user.description}
│ Bị ban: ${user.ban ? "Có" : "Không"}
│ Vai trò: ${user.role}
├─────────────⭔
│ Thống kê
│ Đang theo dõi: ${user.relation_info.statistics.following_count}
│ Người theo dõi: ${user.relation_info.statistics.follower_count}
│ Tổng lượt thích: ${userStatistics.like_count}
│ Tổng số mẫu: ${userStatistics.template_count}
│ Số video: ${userStatistics.video_work_count}
│ Tổng tác phẩm: ${userStatistics.work_count}
│ Số hiệu ứng: ${userStatistics.effect_count}
├─────────────⭔
│ Thông tin người sáng tạo
│ Level: ${user.creator_info.level}
│ Level (v2): ${user.creator_info.level_v2}
│ Điểm (v2): ${user.creator_info.score_v2}
│ Hệ thống level: ${creatorLevel}
│ Người mới: ${user.creator_info.is_beginner ? "Có" : "Không"}
│ Ngày đăng mẫu đầu: ${moment(user.creator_info.first_post_template_time).format('DD/MM/YYYY HH:mm:ss')}
├─────────────⭔
│ Thông tin VIP
│ Trạng thái: ${vipInfo.flag === 1 ? "Đang kích hoạt" : "Không kích hoạt"}
${vipInfo.flag === 1 ? `│ Thời gian: ${moment(vipInfo.start_time * 1000).format('DD/MM/YYYY')} - ${moment(vipInfo.end_time * 1000).format('DD/MM/YYYY')}` : ""}
│ Lần đầu đăng ký: ${vipInfo.is_first_subscribe ? "Có" : "Không"}
│ Đã hủy đăng ký: ${vipInfo.is_cancel_subscribe ? "Có" : "Không"}
├─────────────⭔
│ Tab hiển thị
│ Template: ${tabEntrance.template ? "Có" : "Không"}
│ Tutorial: ${tabEntrance.tutorial ? "Có" : "Không"}
│ Replicate: ${tabEntrance.replicate_work ? "Có" : "Không"}
├─────────────⭔
│ Hiển thị hồ sơ TikTok: ${tiktokInfo}
╰─────────────⭓`;

        const attachment = await global.tools.streamURL(user.avatar_url, 'jpg');

        api.sendMessage({ body: message, attachment: attachment }, tid, mid);

    } catch (error) {
        console.error(error);
        api.sendMessage("❎ Không tìm thấy dữ liệu người dùng", tid, mid);
    }
    break;
        case '-s':
       case 'search':
    try {
        const keyword = args.slice(1).join(" ");
        const searchData = await global.capcut.search(keyword);

        if (!searchData || searchData.length === 0) {
            api.sendMessage("Không tìm thấy kết quả.", tid, mid);
            return;
        }

        const img = searchData.map(result => result.cover_url);
        const listMessage = searchData.map((result, index) => 
            `⩺ ${index + 1}. Title: ${result.title}\n⩺ Tác giả: ${result.author.name}\n`
        ).join('\n');

        const attachments = await Promise.all(img.map(url => global.tools.streamURL(url, 'jpg')));

        api.sendMessage({
            body: `\n${listMessage}\n\n⩺ Reply (phản hồi) STT để tải video`,
            attachment: attachments
        }, tid, (error, info) => {
            if (error) return console.error("Error sending message:", error);
            global.client.handleReply.push({
                type: "search",
                name: exports.config.name,
                author: sid,
                messageID: info.messageID,
                result: searchData,
            });
        });
    } catch (error) {
        console.error("Error:", error.message);
        api.sendMessage("Đã xảy ra lỗi, vui lòng thử lại sau.", tid, mid);
    }
    break;
        case '-p':
        case 'post':
    try {
        const url = args.slice(1).join(" ");
        if (!url) {
            return api.sendMessage("Vui lòng cung cấp link bài đăng CapCut!", tid, mid);
        }
        const data = await global.capcut.post(url);
        if (!data || data.length === 0) {
            return api.sendMessage("❎ Không tìm thấy bài đăng!", tid, mid);
        }

        const listMessage = data.map((item, index) => 
            `${index + 1}. ${item.title}`
        ).join('\n\n');

        api.sendMessage(`${listMessage}\n\n📌 Reply (phản hồi) STT để tải video`, tid, (error, info) => {
            if (error) return console.error("Error sending message:", error);
            global.client.handleReply.push({
                type: "post",
                name: exports.config.name,
                author: sid,
                messageID: info.messageID,
                data: data,
            });
        });
    } catch (error) {
        console.error("Error:", error);
        api.sendMessage("❎ Đã xảy ra lỗi khi tải bài đăng!", tid, mid);
    }
    break;
        case '-t':
        case 'trending':
    try {
        const data = await global.capcut.trending();
        if (!data || data.length === 0) {
            return api.sendMessage("❎ Không tìm thấy video trending!", tid, mid);
        }

        const listMessage = data.map((item, index) => 
            `${index + 1}. ${item.title}\n👤 Author: ${item.authorName}\n👁️ Lượt sử dụng: ${item.usage}`
        ).join('\n\n');

        await api.sendMessage(`📈 Danh sách video trending:\n\n${listMessage}\n\n📌 Reply (phản hồi) STT để tải video`, tid, async (error, info) => {
            if (error) {
                console.error("Error sending message:", error);
                return;
            }
            global.client.handleReply.push({
                type: "trending",
                name: this.config.name,
                author: event.senderID,
                messageID: info.messageID,
                data: data,
            });
        });
    } catch (error) {
        console.error("Error:", error);
        api.sendMessage("❎ Đã xảy ra lỗi khi tải trending!", tid, mid);
    }
    break;
        // Các case khác
        // ...
        
        default:
            const helpMessage = `╭─────────────⭓
│ HƯỚNG DẪN SỬ DỤNG CAPCUT
│
│ ⭔ ${global.config.PREFIX}capcut -i [link]
│ → Xem thông tin người dùng
│
│ ⭔ ${global.config.PREFIX}capcut -s [từ khóa]
│ → Tìm kiếm mẫu theo từ khóa
│
│ ⭔ ${global.config.PREFIX}capcut -p [link]
│ → Xem thông tin bài đăng
│
│ ⭔ ${global.config.PREFIX}capcut -t
│ → Xem danh sách video trending
╰─────────────⭓`;
            api.sendMessage(helpMessage, tid, mid);
            break;
    }
};
function convertTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}/${month}/${year}`;
}
module.exports.handleReply = async function ({ event, api, handleReply, args }) {
    const { threadID: tid, messageID: mid, body } = event;
    switch (handleReply.type) {
        case 'search':
            const choose = parseInt(body);
            api.unsendMessage(handleReply.messageID);
            if (isNaN(choose)) {
                return api.sendMessage('⩺ Vui lòng nhập 1 con số', tid, mid);
            }
            if (choose > 6 || choose < 1) {
                return api.sendMessage('⩺ Lựa chọn không nằm trong danh sách', tid, mid);
            }
            
                try {
                    const chosenVideo = handleReply.result[choose - 1];
                    const videoResponse = await axios.get(chosenVideo.video_url, { responseType: 'stream' });
                    const videoData = videoResponse.data;
                api.sendMessage({
                    body: `[ CAPCUT - VIDEO ]\n──────────────────\n⩺ Tiêu đề: ${chosenVideo.title}\n⩺ Tác giả: ${chosenVideo.author.name} (${chosenVideo.author.unique_id})\n⩺ Thời lượng: ${formatTime(chosenVideo.duration)} giây\n⩺ Số ảnh cần dùng: ${chosenVideo.fragment_count}\n⩺ Lượt dùng mẫu: ${chosenVideo.usage_amount}\n⩺ Lượt xem: ${chosenVideo.play_amount}\n⩺ Lượt thích: ${chosenVideo.like_count}\n⩺ Lượt comment: ${chosenVideo.interaction.comment_count}\n⩺ Lượt lưu: ${chosenVideo.favorite_count}\n⩺ Ngày tải lên: ${moment.unix(chosenVideo.create_time).tz('Asia/Ho_Chi_Minh').format('HH:mm:ss - DD/MM/YYYY')}\n⩺ Link mẫu: https://www.capcut.com/template-detail/${chosenVideo.web_id} `,
                    attachment: videoData
                }, tid, mid);
            } catch (error) {
                console.error("Error:", error.message);
                api.sendMessage("Đã xảy ra lỗi khi tải video.", tid, mid);
            }
            break;
        case 'post':
            try {
                const postChoose = parseInt(body);
                api.unsendMessage(handleReply.messageID);
                if (isNaN(postChoose)) {
                    return api.sendMessage('⚠️ Vui lòng nhập 1 con số', tid, mid);
                }
                if (postChoose > handleReply.data.length || postChoose < 1) {
                    return api.sendMessage('❎ Lựa chọn không nằm trong danh sách', tid, mid);
                }

                const chosenPost = handleReply.data[postChoose - 1];
                const message = {
                    body: `⩺ Tiêu đề: ${chosenPost.title}\n⩺ Tác giả: ${chosenPost.author.name} (${chosenPost.author.unique_id})\n⩺ Thời lượng: ${formatTime(chosenPost.duration)}\n⩺ Số ảnh cần dùng: ${chosenPost.fragment_count}\n⩺ Lượt dùng mẫu: ${chosenPost.usage_amount}\n⩺ Lượt xem: ${chosenPost.play_amount}\n⩺ Lượt thích: ${chosenPost.like_count}\n⩺ Lượt comment: ${chosenPost.comment_count}\n⩺ Ngày tải lên: ${moment.unix(chosenPost.create_time).tz('Asia/Ho_Chi_Minh').format('HH:mm:ss - DD/MM/YYYY')}`,
                    attachment: await global.tools.streamURL(chosenPost.video_url, 'mp4')
                };

                await api.sendMessage(message, tid, mid);
            } catch (error) {
                console.error("Error:", error.message);
                await api.sendMessage("❎ Đã xảy ra lỗi khi tải video!", tid, mid);
            }
            break;

        case 'trending':
            try {
                const trendChoose = parseInt(body);
                api.unsendMessage(handleReply.messageID);
                if (isNaN(trendChoose)) {
                    return api.sendMessage('⚠️ Vui lòng nhập 1 con số', tid, mid);
                }
                if (trendChoose > handleReply.data.length || trendChoose < 1) {
                    return api.sendMessage('❎ Lựa chọn không nằm trong danh sách', tid, mid);
                }

                const chosenTrend = handleReply.data[trendChoose - 1];
                const message = {
                    body: `🎥 ${chosenTrend.title}\n👤 Author: ${chosenTrend.authorName}\n📝 Mô tả: ${chosenTrend.description}\n👁️ Lượt sử dụng: ${chosenTrend.usage}\n📐 Kích thước: ${chosenTrend.videoWidth}x${chosenTrend.videoHeight}`,
                    attachment: await global.tools.streamURL(chosenTrend.videoUrl, 'mp4')
                };

                await api.sendMessage(message, tid, mid);
            } catch (error) {
                console.error("Error:", error.message);
                await api.sendMessage("❎ Đã xảy ra lỗi khi tải video!", tid, mid);
            }
            break;
    }
};

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getdata(data) {
    const results = data.video_templates;
    const randomIndexes = [];
    while (randomIndexes.length < 6) {
        const randomIndex = Math.floor(Math.random() * results.length);
        if (!randomIndexes.includes(randomIndex)) {
            randomIndexes.push(randomIndex);
        }
    }
    return randomIndexes.map(index => results[index]);
}