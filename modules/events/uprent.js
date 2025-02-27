const fs = require('fs');
const path = require('path');
const logger = require("../../utils/log.js");

module.exports = {
  config: {
    name: "updateRent",
    eventType: ["log:unsubscribe"],
    version: "1.0.1",
    credits: "DongDev",
    info: "Xóa dữ liệu rent khi bot thoát khỏi nhóm hoặc nhóm hết hạn thuê"
  },

  run: async function({ event, api }) {
    try {
      const { threadID, logMessageData } = event;
      const { leftParticipantFbId } = logMessageData;
      const botID = api.getCurrentUserID();
      const checkRentPath = path.join(__dirname, '../../modules/commands/data/thuebot.json');

      if (!fs.existsSync(checkRentPath)) {
        logger("File thuebot.json không tồn tại.", "[ Lỗi ]");
        return;
      }

      // Đọc file JSON
      let threadData;
      try {
        threadData = JSON.parse(fs.readFileSync(checkRentPath, 'utf8'));
        if (!Array.isArray(threadData)) throw new Error("File JSON không phải mảng.");
      } catch (error) {
        logger("Lỗi khi đọc file JSON: " + error.message, "[ Lỗi ]");
        return;
      }

      // Xóa dữ liệu nếu bot rời nhóm
      if (leftParticipantFbId === botID) {
        threadData = threadData.filter(item => item.t_id !== threadID);
        fs.writeFileSync(checkRentPath, JSON.stringify(threadData, null, 2), 'utf8');
        logger(`Đã xóa dữ liệu rent của nhóm: ${threadID} do bot rời khỏi nhóm`, "[ Cập Nhật ]");
      }

      // Kiểm tra và rời nhóm nếu hết hạn thuê
      const currentTime = Date.now();
      for (const item of threadData) {
        if (new Date(item.time_end).getTime() < currentTime) {
          try {
            await api.removeUserFromGroup(botID, item.t_id); // Rời nhóm
            logger(`Bot đã rời nhóm: ${item.t_id} do hết hạn thuê`, "[ Cập Nhật ]");

            // Xóa dữ liệu nhóm khỏi file JSON
            threadData = threadData.filter(thread => thread.t_id !== item.t_id);
            fs.writeFileSync(checkRentPath, JSON.stringify(threadData, null, 2), 'utf8');
          } catch (err) {
            logger(`Không thể rời nhóm ${item.t_id}: ${err.message}`, "[ Lỗi ]");
          }
        }
      }
    } catch (error) {
      logger("Lỗi khi xử lý sự kiện: " + error.message, "[ Lỗi ]");
    }
  }
};