module.exports.config = {
    name: "kick",
    version: "1.0.0",
    hasPermssion: 1,
    usePrefix: false,
    credits: "Dgk",
    description: "Xoá thành viên khỏi nhóm bằng cách tag, reply hoặc dùng 'all'. Hủy kick bằng cách gửi lệnh 'hủy'.",
    commandCategory: "Quản trị viên",
    usages: "[tag/reply/all]",
    cooldowns: 0
};

const kickTracking = new Map();

module.exports.run = async function ({ args, api, event, Threads, Users }) {
    const { participantIDs, adminIDs } = (await Threads.getData(event.threadID)).threadInfo;
    const botID = api.getCurrentUserID();
    const commandSender = event.senderID;

    if (!adminIDs.some(admin => admin.id === botID)) {
        return api.sendMessage("❎ Bot cần quyền quản trị viên để thực hiện lệnh kick.", event.threadID, event.messageID);
    }

    if (!adminIDs.some(admin => admin.id === commandSender)) {
        return api.sendMessage("❎ Bạn đéo đủ quyền hạn để kick người khác.", event.threadID, event.messageID);
    }

    if (args[0] === "hủy") {
        const lastKickMessageID = Array.from(kickTracking.keys()).pop();
        const lastKickInfo = kickTracking.get(lastKickMessageID);

        if (lastKickInfo && lastKickInfo.commandSender === commandSender) {
            clearTimeout(lastKickInfo.countdownID);
            const name = await Users.getNameUser(lastKickInfo.userID);
            api.sendMessage(`✅ Đã hủy kick ${name} khỏi nhóm.`, event.threadID);
            kickTracking.delete(lastKickMessageID);
            return; // Dừng lại, không cần tiếp tục với phần kick nữa
        } else {
            api.sendMessage("❎ Không có lượt kick nào để hủy.", event.threadID);
            return; // Nếu không có kick nào để hủy, dừng lại luôn
        }
    }

    const kickWithCountdown = async (userID) => {
        const name = await Users.getNameUser(userID);

        try {
            const message = await api.sendMessage(`⚠️ Sẽ kick ${name} sau 5 giây...`, event.threadID);
            const editMessageID = message.messageID;

            const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

            const countdownID = setTimeout(async () => {
                api.removeUserFromGroup(userID, event.threadID);
                await api.editMessage(editMessageID, `✅ Đã kick ${name} khỏi nhóm.`);
                kickTracking.delete(editMessageID);
            }, 5000);

            kickTracking.set(editMessageID, { userID, countdownID, commandSender });

            for (let i = 4; i >= 1; i--) {
                await sleep(1000);
                await api.editMessage(editMessageID, `⚠️ Sẽ kick ${name} sau ${i} giây...`);
            }

        } catch (error) {
            console.error("Error in kickWithCountdown function:", error);
            api.sendMessage("Đã xảy ra lỗi khi thực hiện lệnh kick", event.threadID);
        }
    };

    try {
        if (args.join().includes('@')) {
            const mention = Object.keys(event.mentions);
            for (let userID of mention) {
                kickWithCountdown(userID);
            }
        } else if (event.type === "message_reply") {
            const uid = event.messageReply.senderID;
            kickWithCountdown(uid);
        } else if (args[0] === "all") {
            const listUserID = participantIDs.filter(ID => ID !== botID && ID !== event.senderID);
            for (let idUser of listUserID) {
                await kickWithCountdown(idUser);
            }
        } else {
            api.sendMessage("❎ Vui lòng tag, reply hoặc dùng 'all' để kick.", event.threadID, event.messageID);
        }
    } catch {
        api.sendMessage('❎ Đã xảy ra lỗi khi kick người dùng.', event.threadID, event.messageID);
    }
};