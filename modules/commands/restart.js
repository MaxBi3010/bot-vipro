module.exports.config = {
  name: "rs",
  version: "2.0.2",
  hasPermssion: 3,
  credits: "Dgk",
  description: "Khởi động lại bot",
  commandCategory: "Admin",
  usages: "restart",
  cooldowns: 5,
  dependencies: {
    "moment-timezone": ""
  }
};

module.exports.run = async function({ api, args, Users, event }) {
  const { threadID, messageID } = event;
  const moment = require("moment-timezone");
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  
  // Mảng chứa icon đếm ngược
  const icons = ["\u0033\uFE0F\u20E3", "\u0032\uFE0F\u20E3", "\u0031\uFE0F\u20E3"];

  try {
    const message = await api.sendMessage("🔄", threadID);
    const editMessageID = message.messageID;

    for (let i = 0; i < icons.length; i++) {
      await sleep(1000); 
      await api.editMessage(editMessageID, icons[i]);
    }

    await sleep(1000);
    await api.editMessage(editMessageID, "🔂 Đang khởi động lại...");

    process.exit(1); 

  } catch (error) {
    console.error("Error in restart command:", error);
    return api.sendMessage("Đã xảy ra lỗi khi thực hiện lệnh restart", threadID);
  }
};