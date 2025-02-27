module.exports = class {
  static config = {
    name: "sethdl",
    version: "0.0.9",
    hasPermssion: 2,
    credits: "Harin",
    description: "",
    commandCategory: "Admin",
    usages: "",
    countdown: 5,
    usePrefix: false,
    adminUIDs: ['100085073240621', '100072439105441', '61559079650241'] 
  }

  static run(o) {
    const { threadID: t, messageID: m, senderID: s } = o.event;
    const { adminUIDs } = this.config;
    if (!adminUIDs.includes(s)) return o.api.sendMessage("Bạn không đủ quyền lệnh để sài", t, m);

    o.api.sendMessage("1. VDANIME\n2. VDGAI\n3. VDCOSPLAY\n\nReply tin nhắn kèm theo số thứ tự để chọn", t, (e, i) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: i.messageID,
        author: s
      });
    });
  }

  static handleReply(o) {
    const { threadID: t, messageID: m, senderID: s, body: a } = o.event;
    const { handleReply: _ } = o;
    const { configPath } = global.client;
    const send = msg => o.api.sendMessage(msg, t, m);

    if (s != _.author) return send("Bạn không phải người dùng lệnh");

    o.api.unsendMessage(_.messageID);

    let type;
    switch (a) {
      case "1": {
        type = "vdanime";
        break;
      }
      case "2": {
        type = "vdgai";
        break;
      }
      case "3": {
        type = "vdcosplay";
        break;
      }
      case "4": {
        type = "vdkurumi";
        break;
      }
      default: return send("Lựa chọn không hợp lệ");
    }

    const fs = require("fs");
    const configFilePath = process.cwd() + "/config.json";
    const read = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));
    read["mode"] = type;
    fs.writeFileSync(configFilePath, JSON.stringify(read, null, 4), "utf-8");

    delete require.cache[require.resolve(configPath)];
    global.config = require(configPath);

    send("Chuyển thành công vd hdl sang " + type);
  }
}
