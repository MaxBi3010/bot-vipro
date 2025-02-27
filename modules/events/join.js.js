module.exports.config = {
    name: "joinNôtì",
    eventType: ["log:subscribe"],
    version: "1.0.3",
    credits: "Dgk",
    description: "Cập nhật nickname khi bot được thêm vào nhóm"
};

module.exports.run = async function({ api, event }) {
    const { threadID } = event;

    // Kiểm tra xem bot có vừa được thêm vào nhóm không
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        try {
            // Gửi tin nhắn "3"
            const message = await api.sendMessage("3", threadID);
            const editMessageID = message.messageID;

            const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

            // Đếm từ 3 đến 1
            for (let i = 2; i >= 1; i--) {
                await sleep(1000); // Chờ 1 giây
                await api.editMessage(editMessageID, `${i}`);
            }

            await sleep(1000);

            // Gửi tin nhắn "Kết nối thành công!"
            await api.editMessage(editMessageID, "Kết nối thành công!");

            // Thay đổi nickname của bot
            api.changeNickname(
                ` ${global.config.PREFIX} ┊ ${(!global.config.BOTNAME) ? "Kết nối thành công :<" : global.config.BOTNAME}`,
                threadID,
                api.getCurrentUserID()
            );

        } catch (error) {
            console.error("Lỗi trong lệnh joinNoti:", error);
            api.sendMessage("Đã xảy ra lỗi khi thực hiện lệnh joinNoti", threadID);
        }
    }
};