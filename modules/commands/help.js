this.config = {
    name: "help",
    version: "1.1.1",
    hasPermssion: 0,
    credits: "DC-Nam mod by Niio-team",
    description: "Xem danh sách lệnh và info",
    commandCategory: "Tiện ích",
    usages: "[tên lệnh/all]",
    cooldowns: 0
};

this.run = async function({
    api,
    event,
    args
}) {
    const {
        threadID: tid,
        messageID: mid
    } = event;
    const cmds = global.client.commands;

    var type = !args[0] ? "" : args[0].toLowerCase();
    var msg = "";

    if (type) {
        const command = Array.from(cmds.values()).find(cmd => cmd.config.name.toLowerCase() === type);
        if (!command) {
            msg = `⚠️ Không tìm thấy lệnh '${type}' trong hệ thống.`;
            return api.sendMessage(msg, tid, mid);
        }
        const cmd = command.config;
        msg = `[ HƯỚNG DẪN SỬ DỤNG ]\n\n📜 Tên lệnh: ${cmd.name}\n🕹️ Phiên bản: ${cmd.version}\n🔑 Quyền Hạn: ${TextPr(cmd.hasPermssion)}\n📝 Mô Tả: ${cmd.description}\n📌 Cách Dùng: ${cmd.usages}\n💡 Credit: ${cmd.credits}`;
        
        return api.sendMessage(msg, tid, mid);
    }
}

function TextPr(permission) {
    p = permission;
    return p == 0 ? "Thành Viên" : p == 1 ? "Quản Trị Viên" : p == 2 ? "Admin Bot" : "Toàn Quyền";
}