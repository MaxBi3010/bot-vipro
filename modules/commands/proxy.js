const axios = require('axios');

module.exports.config = {
  name: "proxy",
  version: "1.0.0",
  hasPermission: 2,
  credits: "Dgk",
  description: "Lấy dữ liệu proxy từ API",
  commandCategory: "Admin",
  usages: "<số lượng>",
  cooldowns: 0
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const number = parseInt(args[0]);

  if (!number || isNaN(number)) {
    api.sendMessage('❎ Vui lòng nhập đúng định dạng: <số lượng>', threadID, messageID);
    return;
  }

  api.sendMessage(`🔄 Đang lấy danh sách ${number} proxy...\nLoading...`, threadID, messageID);

  const urlApi = `https://api.azig.dev/others/proxies?apikey=apiazigdev`;
  let proxies = [];

  for (let i = 0; i < number; i++) {
    try {
      const response = await axios.get(urlApi);
      if (response.status === 200 && response.data.success) {
        proxies.push(response.data.proxy);
      } else {
        api.sendMessage(`📝 Không lấy được proxy (Lần thử: ${i + 1})`, threadID, messageID);
      }
    } catch (error) {
      api.sendMessage(`⚠️ Lỗi khi lấy proxy (Lần thử: ${i + 1}): ${error.message}`, threadID, messageID);
    }
  }

  if (proxies.length > 0) {
    const proxyList = proxies.map((proxy, index) => `${index + 1}. ${proxy}`).join('\n');

    try {
      const mockResponse = await axios.post("https://api.mocky.io/api/mock", {
        "status": 200,
        "content": `${JSON.stringify(proxies, null, 2)}`,
        "content_type": "application/json",
        "charset": "UTF-8",
        "secret": "AkihikoBot",
        "expiration": "never"
      });

      api.sendMessage(`✏️ Danh sách proxy:\n📝 Kết quả RunMocky: ${mockResponse.data.link}`, threadID, messageID);
    } catch (error) {
      api.sendMessage(`⚠️ Lỗi khi gửi đến RunMocky: ${error.message}`, threadID, messageID);
      console.error(`⚠️ Đã xảy ra lỗi khi gửi đến RunMocky: ${error}`);
    }
  } else {
    api.sendMessage("❎ Không lấy được proxy nào.", threadID, messageID);
  }
};