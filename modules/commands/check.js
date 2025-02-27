const { PREFIX } = global.config;
module.exports = {
    config: {
        name: "check",
        version: "1.0.1",
        hasPermission: 0,
        credits: "DungUwU && Nghĩa",
        description: "Check tương tác ngày/tuần/toàn bộ",
        commandCategory: "Box",
        usages: "[all/week/day]",
        cooldowns: 5,
        dependencies: {
            "fs": "",
            "moment-timezone": ""
        }
    },

    onLoad: async function() {
        const fs = require("fs-extra");
        const dir = __dirname + "/tt";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    },

    run: async function({ api, event, args, Users, Threads, Currencies }) {
        const { threadID, messageID, senderID, mentions } = event;
        let threadSetting = global.data.threadData.get(threadID) || {};
        let prefix = threadSetting.PREFIX || PREFIX;
        const fs = require("fs-extra");
        const moment = require("moment-timezone");
        const path = __dirname + "/tt/" + threadID + '.json';

        if (!fs.existsSync(path)) {
            return api.sendMessage("⚠️ Chưa có dữ liệu", threadID);
        }

        const threadData = JSON.parse(fs.readFileSync(path));
        const query = args[0] ? args[0].toLowerCase() : '';

        switch (query) {
            case 'box': {
                let body_ = event.args[0].replace(this.config.name, '') + 'box info';
                let args_ = body_.split(' ');
                return require('./box.js').run({ ...arguments[0], args: args_.slice(1), event: { ...event, args: args_, body: body_ }});
            }

            case 'reset': {
                let dataThread = (await Threads.getData(threadID)).threadInfo;
                if (!dataThread.adminIDs.some(item => item.id == senderID)) 
                    return api.sendMessage('Bạn không đủ quyền hạn để sử dụng!', threadID, messageID);
                const threadData = JSON.parse(fs.readFileSync(path));
                const { memberJoinDates, botJoinDate } = threadData;
                const today = moment.tz("Asia/Ho_Chi_Minh").day();
                const newData = {
                    total: threadData.total.map(user => ({ id: user.id, count: 0 })),
                    week: threadData.total.map(user => ({ id: user.id, count: 0 })),
                    day: threadData.total.map(user => ({ id: user.id, count: 0 })),
                    time: today,
                    last: {
                        time: today,
                        day: [],
                        week: []
                    },
                    lastInteraction: {},
                    memberJoinDates,
                    botJoinDate 
                };
                fs.writeFileSync(path, JSON.stringify(newData, null, 4));
                return api.sendMessage(`Đã reset toàn bộ số tin nhắn về 0 nhưng vẫn giữ thông tin ngày vào nhóm của các thành viên`, threadID);
            }

            case 'loc': {
                if (!global.config.ADMINBOT.includes(senderID)) {
                    return api.sendMessage("⚠️ Bạn không đủ quyền hạn để sử dụng lệnh này", threadID, messageID);
                }

                let count = 0, removedCount = 0;
                const allThreads = await api.getThreadList(100, null, ['INBOX']);
                const allThreadIDs = new Set(allThreads.map(t => t.threadID));
                
                const dataPath = __dirname + '/tt/';
                const files = fs.readdirSync(dataPath);
                
                for (const file of files) {
                    if (!file.endsWith('.json')) continue;
                    count++;
                    
                    const threadID = file.replace('.json', '');
                    const filePath = dataPath + file;
                    
                    if (!allThreadIDs.has(threadID)) {
                        fs.unlinkSync(filePath);
                        removedCount++;
                        console.log(`[CHECK] Đã xóa file của nhóm: ${threadID}`);
                    }
                }

                return api.sendMessage(
                    `✅ Đã lọc xong dữ liệu nhóm!\n\n` +
                    `📊 Thống kê:\n` +
                    `➣ Tổng số nhóm: ${count}\n` +
                    `➣ Số nhóm đã xóa: ${removedCount}\n` +
                    `➣ Số nhóm còn lại: ${count - removedCount}\n\n` +
                    `💡 Đã xóa ${removedCount} nhóm không tồn tại khỏi dữ liệu`,
                    threadID
                );
            }

            case 'ndfb': {
                let body_ = event.args[0].replace(this.config.name, '') + 'kickdnfb';
                let args_ = body_.split(' ');
                return require('./kickndfb.js').run({ ...arguments[0], args: args_.slice(1), event: { ...event, args: args_, body: body_ }});
            }

            case 'locmem': {
                let threadInfo = await api.getThreadInfo(threadID);
                if (!threadInfo.adminIDs.some(e => e.id == senderID)) 
                    return api.sendMessage("❎ Bạn không có quyền sử dụng lệnh này", threadID);
                if (!args[1] || isNaN(args[1])) return api.sendMessage("Error", threadID);
                
                let minCount = +args[1], id_rm = [];
                for (let user of event.participantIDs) {
                    if (user == api.getCurrentUserID()) continue;
                    if (!threadData.total.some(e => e.id == user) || 
                        threadData.total.find(e => e.id == user).count <= minCount) {
                        await api.removeUserFromGroup(user, threadID);
                        id_rm.push(user);
                    }
                }

                return api.sendMessage(
                    `☑️ Đã xóa ${id_rm.length} thành viên ${minCount} tin nhắn\n\n` +
                    id_rm.map(($, i) => `${i + 1}. ${global.data.userName.get($)}`).join('\n'),
                    threadID
                );
            }

            case 'call': {
                let threadInfo = await api.getThreadInfo(threadID);
                if (!threadInfo.adminIDs.some(e => e.id == senderID)) 
                    return api.sendMessage("❎ Bạn không có quyền sử dụng lệnh này", threadID);
                
                const inactiveUsers = threadData.total.filter(user => user.count < 5);
                if (inactiveUsers.length === 0) 
                    return api.sendMessage("Không có thành viên nào dưới 5 tin nhắn.", threadID);
                
                let mentionBody = "", mentionIds = [];
                for (let user of inactiveUsers) {
                    let name = await Users.getNameUser(user.id);
                    mentionBody += `${name}\n`;
                    mentionIds.push({ id: user.id, tag: name });
                }
                
                return api.sendMessage({
                    body: `${mentionBody}\n Dậy tương tác đi, cá cảnh hơi lâu rồi đó 🙂!`,
                    mentions: mentionIds
                }, threadID);
            }
        }
var x = threadData.total.sort((a, b) => b.count - a.count);
        var o = x.map((item, index) => ({ rank: index + 1, ...item }));
        if (!query || (!['all', '-a', 'week', '-w', 'day', '-d'].includes(query) && Object.keys(mentions).length <= 1) || 
            event.type == 'message_reply') {

            if (Object.keys(mentions).length > 0 || !isNaN(query) || !query) {
                const UID = Object.keys(mentions)[0] || query || senderID;
                const userRank = o.findIndex(e => e.id == UID);
                if (userRank === -1) return api.sendMessage("⚠️ Người dùng không có trong dữ liệu", threadID, messageID);
                const userTotal = threadData.total.find(e => e.id == UID)?.count || 0;
                const userRankWeek = threadData.week.sort((a, b) => b.count - a.count).findIndex(e => e.id == UID);
                const userTotalWeek = threadData.week.find(e => e.id == UID)?.count || 0;
                const userRankDay = threadData.day.sort((a, b) => b.count - a.count).findIndex(e => e.id == UID);
                const userTotalDay = threadData.day.find(e => e.id == UID)?.count || 0;
                const nameUID = await Users.getNameUser(UID) || 'Facebook User';

                let threadInfo = await api.getThreadInfo(threadID);
                const nameThread = threadInfo.threadName;

                let permission = global.config.ADMINBOT.includes(UID) ? "Admin Bot" :
                               global.config.NDH.includes(UID) ? "Người Hỗ Trợ" :
                               threadInfo.adminIDs.some(i => i.id == UID) ? "Quản Trị Viên" : "Thành Viên";

                let lastInteraction = threadData.lastInteraction && threadData.lastInteraction[UID] 
                    ? moment(threadData.lastInteraction[UID]).format('HH:mm:ss DD/MM/YYYY')
                    : 'Chưa có';

                let exp = 0;
                try {
                    const userData = await Currencies.getData(UID);
                    exp = userData.exp;
                } catch (error) {
                    console.error("Error getting user data:", error);
                }
                const level = LV(exp);
                const realm = getCultivationRealm(level);
                const joinDate = moment(threadData.memberJoinDates[UID] || threadData.botJoinDate, 'DD/MM/YYYY');
                const timeInGroup = moment.duration(moment().diff(joinDate));
                const timeInGroupStr = `${timeInGroup.years() > 0 ? `${timeInGroup.years()} năm ` : ''}${timeInGroup.months()} tháng ${timeInGroup.days()} ngày`;

                const body = `╭─────────────⭓
│ Nhóm: ${nameThread}
│ 👤Tên: ${nameUID}
│ 🔐Chức Vụ: ${permission}
├ Tin nhắn
│ ├─ Hôm nay: ${userTotalDay}
│ ├─ Trong tuần: ${userTotalWeek}
│ └─ Tổng: ${userTotal}
├ Xếp hạng
│ ├─ Ngày: ${userRankDay + 1}/${threadData.day.length}
│ ├─ Tuần: ${userRankWeek + 1}/${threadData.week.length}
│ └─ Tổng: ${userRank + 1}/${threadData.total.length}
├ Thông tin thêm
│ ├─ Tương tác gần đây: ${lastInteraction}
│ ├─ Ngày vào nhóm: ${joinDate.format('DD/MM/YYYY')}
│ └─ Cảnh Giới: ${realm}
│  
╰─────────────⭓

📌 Thả cảm xúc "❤️" để xem tổng tin nhắn của nhóm`;

                return api.sendMessage(body, threadID, (error, info) => {
                    if (error) return console.log(error);
                    global.client.handleReaction.push({
                        name: this.config.name,
                        messageID: info.messageID,
                        sid: senderID,
                    });
                }, event.messageID);
            }
        }

        
        const storage = [];
        for (const item of threadData[query == 'all' || query == '-a' ? 'total' : 
                              query == 'week' || query == '-w' ? 'week' :
                              query == 'day' || query == '-d' ? 'day' : 'total']) {
            const name = await Users.getNameUser(item.id) || 'Facebook User';
            storage.push({ ...item, name });
        }

        storage.sort((a, b) => {
            if (a.count > b.count) return -1;
            if (a.count < b.count) return 1;
            return a.name.localeCompare(b.name);
        });

        let msg = `╭─────────────⭓
│ Kiểm tra tin nhắn ${query == 'all' || query == '-a' ? 'tổng' : 
                    query == 'week' || query == '-w' ? 'tuần' :
                    query == 'day' || query == '-d' ? 'ngày' : 'tổng'}
├─────────────${storage.map((item, index) => `
├${index + 1}. ${item.name}: ${item.count} tin`).join('')}
├─────────────
│ 💬 Tổng tin nhắn: ${storage.reduce((a, b) => a + b.count, 0)}
│ 🏆 Bạn đứng hạng: ${storage.findIndex($ => $.id == event.userID) + 1}/${storage.length}
│
├ Hướng dẫn sử dụng
│ ├─ Reply số thứ tự để xóa thành viên
│ ├─ ${prefix}check locmem + số → xóa thành viên
│ ├─ ${prefix}check reset → reset dữ liệu
│ ├─ ${prefix}check box → thông tin nhóm
│ └─ ${prefix}check call → tag < 5 tin nhắn
╰─────────────⭓`;

        return api.sendMessage(msg, threadID, (error, info) => {
            if (error) return console.log(error);
            if (query == 'all' || query == '-a') {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    tag: 'locmen',
                    author: senderID,
                    storage
                });
            }
            global.client.handleReaction.push({
                name: this.config.name,
                messageID: info.messageID,
                sid: senderID
            });
        }, event.messageID);
    },

    handleReply: async function({ api, event, handleReply, Users }) {
        const { threadID, senderID } = event;
        if (senderID != handleReply.author) return;

        const threadInfo = await api.getThreadInfo(threadID);
        if (!threadInfo.adminIDs.some(item => item.id == senderID)) 
            return api.sendMessage('❎ Bạn không đủ quyền hạn để lọc thành viên!', threadID);
        if (!threadInfo.adminIDs.some(item => item.id == api.getCurrentUserID())) 
            return api.sendMessage('❎ Bot cần quyền QTV!', threadID);
        const idsToRemove = event.body.split(" ");

        if (isNaN(idsToRemove.join(''))) 
            return api.sendMessage(`⚠️ Dữ liệu không hợp lệ`, threadID);

        let msg = [], count_err_rm = 0;
        for (let $ of idsToRemove) {
            let id = handleReply?.storage[$ - 1]?.id;
            if (!!id) {
                try {
                    await api.removeUserFromGroup(id, threadID);
                    msg.push(`${$}. ${global.data.userName.get(id)}`);
                } catch (e) {
                    ++count_err_rm;
                    continue;
                }
            }
        }

        api.sendMessage(
            `🔄 Đã xóa ${idsToRemove.length - count_err_rm} người dùng thành công, thất bại ${count_err_rm}\n\n${msg.join('\n')}`, 
            handleReply.thread
        );
    },

    handleReaction: async function({ event, api, handleReaction, Users, Threads, Currencies }) {
        try {
            if (event.userID != handleReaction.sid) return;
            if (event.reaction != "❤") return;

            const threadID = event.threadID;
            const path_data = __dirname + "/tt/" + threadID + '.json';
            const fs = require('fs-extra');
            if (!fs.existsSync(path_data)) {
                return api.sendMessage("⚠️ Không tìm thấy dữ liệu cho nhóm này.", threadID);
            }
        let threadSetting = global.data.threadData.get(threadID) || {};
        let prefix = threadSetting.PREFIX || PREFIX;
            const threadData = JSON.parse(fs.readFileSync(path_data));
            let userList = await Promise.all(threadData.total.map(async item => {
                try {
                    const userData = await Currencies.getData(item.id);
                    const name = await Users.getNameUser(item.id) || 'Facebook User';
                    const exp = userData.exp || 0;
                    const level = LV(exp);
                    const realm = getCultivationRealm(level);
                    return { ...item, name, exp, level, realm };
                } catch (error) {
                    console.error(`Error processing user ${item.id}:`, error);
                    return { ...item, name: 'Unknown User', exp: 0, level: 0, realm: 'Unknown' };
                }
            }));

            userList.sort((a, b) => b.count - a.count);

            let msg = `╭─────────────⭓
│ Kiểm tra tin nhắn
├─────────────${userList.map((item, index) => `
├${index + 1}. ${item.name}: ${item.count} tin`).join('')}
├─────────────
│ 💬 Tổng tin nhắn: ${userList.reduce((a, b) => a + b.count, 0)}
│ 🏆 Bạn đứng hạng: ${userList.findIndex($ => $.id == event.userID) + 1}/${userList.length}
│
├ Hướng dẫn sử dụng
│ ├─ Reply số thứ tự để xóa thành viên
│ ├─ ${prefix}check locmem + số → xóa thành viên 
│ ├─ ${prefix}check reset → reset dữ liệu
│ ├─ ${prefix}check box → thông tin nhóm
│ └─ ${prefix}check call → tag < 5 tin nhắn
╰─────────────⭓`;

            api.unsendMessage(handleReaction.messageID);

            return api.sendMessage(msg, threadID, (err, info) => {
                if (err) {
                    console.error("Error sending message:", err);
                    return api.sendMessage("❎ Đã xảy ra lỗi khi gửi tin nhắn.", threadID);
                }
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    tag: 'locmen',
                    thread: threadID,
                    author: event.userID,
                    storage: userList,
                });
            }, handleReaction.messageID);
        } catch (error) {
            console.error("Error in handleReaction:", error);
            api.sendMessage("❎ Đã xảy ra lỗi khi xử lý phản ứng.", event.threadID);
        }
    }
};

function getCultivationRealm(level) {
    const realms = [
        { name: "Luyện Khí", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Trúc Cơ", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Khai Quang", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Kim Đan", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Nguyên Anh", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Hóa Thần", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Phản Hư", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Luyện Hư", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Hợp Thể", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Đại Thừa", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Độ Kiếp", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Thiên Tiên", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Chân Tiên", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Kim Tiên", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Thánh Nhân", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Đại Thánh", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Tiên Đế", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Tiên Tôn", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Hỗn Độn", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
        { name: "Vô Cực", levels: 1, subRealms: ["Viên Mãn"] }
    ];

    let currentLevel = 0;
    for (let realm of realms) {
        if (level > currentLevel && level <= currentLevel + realm.levels) {
            const subRealmIndex = Math.floor((level - currentLevel - 1) / (realm.levels / realm.subRealms.length));
            return `${realm.name} ${realm.subRealms[subRealmIndex]}`;
        }
        currentLevel += realm.levels;
    }
    return "Phàm Nhân";
}

function LV(exp) {
    return Math.floor((Math.sqrt(1 + (4 * exp) / 3) + 1) / 2);
}