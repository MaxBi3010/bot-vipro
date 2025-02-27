module.exports.config = {
  name: "out",
  version: "1.0.6",
  hasPermission: 3,
  credits: "KyPhan",
  description: "Quản lý chức năng rời nhóm: xem danh sách, rời nhóm cụ thể hoặc tất cả",
  commandCategory: "Admin",
  usages: "out [list|box|all|ID nhóm]",
  cooldowns: 5,
  dependencies: "",
};

module.exports.run = async function ({ api, event, args }) {
  try {
    if (!args[0]) {
      // Hiển thị bảng chức năng
      const helpMessage = `🔰 Chọn chức năng:
1. out list: Hiển thị danh sách các nhóm bot đang tham gia.
2. out box: Rời nhóm hiện tại.
3. out all: Rời tất cả các nhóm.
4. out [ID nhóm]: Rời nhóm theo ID chỉ định.`;
      return api.sendMessage(helpMessage, event.threadID);
    }

    if (args[0] === "list") {
      // Hiển thị danh sách tất cả các nhóm
      const allThreads = await api.getThreadList(100, null, ["INBOX"]);
      const groupThreads = allThreads.filter(thread => thread.isGroup);

      let listMsg = "🔰 Danh sách các nhóm bot đang tham gia:\n";
      let index = 1;
      let threadIDs = {};

      groupThreads.forEach(thread => {
        listMsg += `${index}. ${thread.name || "Không tên"} (ID: ${thread.threadID})\n`;
        threadIDs[index] = thread.threadID;
        index++;
      });

      listMsg += "\nNhập số thứ tự (stt) để chọn nhóm muốn rời.";

      api.sendMessage(listMsg, event.threadID, (err, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          threadIDs: threadIDs,
          step: 1
        });
      });
    } else if (args[0] === "box") {
      // Rời nhóm hiện tại
      const reason = args.slice(1).join(" ") || "Không có lý do.";
      const idbox = event.threadID;

      // Thông báo trước khi rời nhóm
      await api.sendMessage(`✅ Đã nhận lệnh rời nhóm từ Admin, lý do: ${reason}`, idbox);

      // Rời nhóm
      await api.removeUserFromGroup(api.getCurrentUserID(), idbox);
      api.sendMessage(`✅ Đã rời nhóm hiện tại với lý do: ${reason}`, event.threadID);
    } else if (args[0] === "all") {
      // Rời tất cả các nhóm
      const allThreads = await api.getThreadList(100, null, ["INBOX"]);
      const groupThreads = allThreads.filter(thread => thread.isGroup);

      for (const thread of groupThreads) {
        const idbox = thread.threadID;
        const reason = args.slice(1).join(" ") || "Không có lý do.";

        // Thông báo trước khi rời nhóm
        await api.sendMessage(`✅ Đã nhận lệnh rời nhóm từ Admin, lý do: ${reason}`, idbox);

        // Rời nhóm
        await api.removeUserFromGroup(api.getCurrentUserID(), idbox);
      }

      api.sendMessage("✅ Đã rời tất cả các nhóm.", event.threadID);
    } else if (!isNaN(args[0])) {
      // Rời nhóm theo ID chỉ định
      const idbox = args[0];
      const reason = args.slice(1).join(" ") || "Không có lý do.";

      // Thông báo trước khi rời nhóm
      await api.sendMessage(`✅ Đã nhận lệnh rời nhóm từ Admin, lý do: ${reason}`, idbox);

      // Rời nhóm
      await api.removeUserFromGroup(api.getCurrentUserID(), idbox);
      api.sendMessage(`✅ Đã rời nhóm có ID: ${idbox} với lý do: ${reason}`, event.threadID);
    } else {
      api.sendMessage("⛔ Lệnh không hợp lệ! Hãy thử lại.", event.threadID);
    }
  } catch (error) {
    api.sendMessage(`⛔ Đã xảy ra lỗi: ${error.message}`, event.threadID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  try {
    if (event.senderID !== handleReply.author) return;

    if (handleReply.step === 1) {
      const index = parseInt(event.body);
      const idbox = handleReply.threadIDs[index];

      if (!idbox) return api.sendMessage("⛔ Số thứ tự không hợp lệ!", event.threadID);

      api.sendMessage("💬 Vui lòng nhập lý do để rời nhóm:", event.threadID, (err, info) => {
        global.client.handleReply.push({
          name: "out",
          messageID: info.messageID,
          author: event.senderID,
          threadID: idbox,
          step: 2
        });
      });
    } else if (handleReply.step === 2) {
      const reason = event.body || "Không có lý do.";
      const idbox = handleReply.threadID;

      // Thông báo trước khi rời nhóm
      await api.sendMessage(
        `✅ Đã nhận lệnh rời nhóm từ Admin, lý do: ${reason}`,
        idbox
      );

      // Xóa dữ liệu nhóm nếu API hỗ trợ
      if (api.deleteGroupData) {
        await api.deleteGroupData(idbox);
      }

      // Rời nhóm
      await api.removeUserFromGroup(api.getCurrentUserID(), idbox);

      api.sendMessage(`✅ Đã rời nhóm có ID: ${idbox} với lý do: ${reason}`, event.threadID);
    }
  } catch (error) {
    api.sendMessage(`⛔ Đã xảy ra lỗi: ${error.message}`, event.threadID);
  }
};
