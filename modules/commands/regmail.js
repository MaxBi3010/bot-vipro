const axios = require('axios');

module.exports.config = {
    name: "regm",
    version: "1.0.0",
    hasPermssion: 3,
    credits: "Dgk",
    description: "",
    commandCategory: "Người Dùng",
    usages: "[tên muốn tạo email]",
    usePrefix: true,
    cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const name = args[0];

    if (!name) {
        return api.sendMessage('❎ Vui lòng cung cấp tên để tạo regmail!', threadID, messageID);
    }

    const apiURL = `https://api.joshweb.click/api/genmicro?name=${encodeURIComponent(name)}`;

    try {
        const response = await axios.get(apiURL);
        const { status, result } = response.data;

        if (status) {
            const { email, password } = result;
            const message = `${email} ${password}`;
            return api.sendMessage(message, threadID, messageID);
        } else {
            return api.sendMessage('❎ Lỗi: Không thể tạo regmail. Vui lòng thử lại sau.', threadID, messageID);
        }
    } catch (error) {
        return api.sendMessage(`⚠️ Đã xảy ra lỗi khi kết nối API: ${error.message}`, threadID, messageID);
    }
};