const fs = require("fs");
const { resolve } = require("path");

module.exports.config = {
    name: "antijoin",
    eventType: ["log:subscribe"],
    version: "1.0.0",
    credits: "DongDev",
    description: "Ngăn chặn việc thêm thành viên vào nhóm",
};

module.exports.run = async function ({ event, api }) {
    const { logMessageType, logMessageData, threadID } = event;
    const botID = api.getCurrentUserID();
    
    // Đường dẫn đến file dữ liệu anti join
    const path = resolve(__dirname, '../commands', 'data', 'antijoin.json');

    try {
        const dataA = JSON.parse(fs.readFileSync(path, "utf8"));

        const foundGroup = Object.keys(dataA).find(groupID => groupID === threadID);

        // Kiểm tra xem chế độ anti join có được bật cho nhóm này không
        if (dataA && foundGroup !== undefined && dataA[foundGroup] === true) {
            switch (logMessageType) {
                case "log:subscribe": {
                    // Lặp qua danh sách thành viên được thêm vào nhóm
                    for (const user of logMessageData.addedParticipants) {
                        // Kiểm tra nếu thành viên không phải bot
                        if (user.userFbId !== botID) {
                            // Kick thành viên khỏi nhóm
                            api.removeUserFromGroup(user.userFbId, threadID, (err) => {
                                if (err) {
                                    console.error(`Không thể kick thành viên với ID ${user.userFbId}:`, err);
                                }
                            });
                        }
                    }
                    break;
                }
            }
        }
    } catch (error) {
        console.error("Đã xảy ra lỗi khi xử lý sự kiện antijoin:", error);
    }
};