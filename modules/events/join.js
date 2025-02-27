module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.3",
    credits: "Dgk",
    description: "Cập nhật nickname khi bot được thêm vào nhóm"
};

module.exports.run = async function({ api, event }) {
    const { threadID } = event;
    if (!event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) return;

    try {
        const message = await api.sendMessage("3", threadID);
        await new Promise(resolve => setTimeout(resolve, 3000));
        await api.editMessage(message.messageID, "Kết nối thành công!");
        api.changeNickname(` ${global.config.PREFIX} ┊ ${global.config.BOTNAME || "Kết nối thành công :<"}`, threadID, api.getCurrentUserID());
    } catch (error) {
        console.error("Lỗi trong lệnh joinNoti:", error);
        api.sendMessage("Đã xảy ra lỗi khi thực hiện lệnh joinNoti", threadID);
    }
};