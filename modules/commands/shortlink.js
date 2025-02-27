module.exports.config = {
    name: "shortlink",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Mirai Team",
    description: "Rút gọn URL của bạn",
    commandCategory: "Người dùng",
    usages: "[link]",
    cooldowns: 5,
    envConfig: {
        apiKey: "pa7svHrb" // Thay bằng API key của bạn, nếu cần
    }
};

module.exports.run = async ({ api, event, args }) => {
    const axios = require("axios");

    // Kiểm tra URL hợp lệ
    const regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
    if (!regex.test(args[0])) {
        return api.sendMessage("Phải là một URL cần rút gọn!", event.threadID, event.messageID);
    }

    // Thêm tiền tố nếu thiếu
    let url = args[0];
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }

    console.log("URL gửi đến API:", url);

    try {
        // Gọi API rút gọn link
        const response = await axios.get(`https://apitntxtrick.onlitegix.com/rutgonlink?link=${encodeURIComponent(url)}`);

        console.log("Phản hồi API:", response.data);

        // Kiểm tra kết quả từ API
        if (response.data.result_url) {
            return api.sendMessage("Link đã rút gọn: " + response.data.result_url, event.threadID, event.messageID);
        } else {
            return api.sendMessage("Đã có lỗi xảy ra: Không có kết quả rút gọn", event.threadID, event.messageID);
        }
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return api.sendMessage("Không thể rút gọn URL. Vui lòng thử lại sau!", event.threadID, event.messageID);
    }
};