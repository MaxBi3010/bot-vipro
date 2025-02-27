module.exports.config = {
    name: "add",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Dgk",
    description: "Thêm người dùng vào tất cả các nhóm mà bot đang tham gia bằng link hoặc uid",
    commandCategory: "Box chat",
    usages: "[args]",
    images: [],
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const link = args.join(" ");
    const axios = require('axios');

    if (!args[0]) return api.sendMessage('❎ Vui lòng nhập link hoặc id người dùng muốn thêm vào nhóm!', threadID, messageID);

    
    const allThreads = await api.getThreadList(100, null, ["INBOX"]);
    const threadIDs = allThreads.map(thread => thread.threadID);

    let uidUser;
    if (link.indexOf(".com/") !== -1) {
        uidUser = await api.getUID(link);
    } else {
        uidUser = args[0];
    }

    let successCount = 0;
    let failureCount = 0;

    for (const thread of threadIDs) {
        const threadInfo = await api.getThreadInfo(thread);
        const { participantIDs, approvalMode, adminIDs } = threadInfo;

        if (participantIDs.includes(uidUser)) {
            continue; 
        }

        try {
            await api.addUserToGroup(uidUser, thread);
            if (approvalMode && !adminIDs.some(item => item.id == api.getCurrentUserID())) {
                failureCount++; 
            } else {
                successCount++; 
            }
        } catch (err) {
            failureCount++; 
        }
    }

    api.sendMessage(`✅ Đã thêm thành công vào ${successCount} nhóm.\n❎ Thất bại ở ${failureCount} nhóm.`, threadID, messageID);
};