const fs = require('fs');
const path = require('path');

const data = [
  "369239263222822",
  "184571475493841",
  "155887105126297",
  "551710554864076",
  "788171717923679",
  "1458999184131858",
  "369239383222810",
  "1598371140426188",
  "1598410647088904",
  "1649890685274233",
  "1598405803756055",
  "1598406790422623",
  "1458993787465731",
  "2041015329459274",
  "1458994000799043",
  "1458994024132374",
  "2041011726126301",
  "2041011836126290",
  "041011389459668",
  "2041021119458695",
  "2041021119458695",
  "1747085962269322",
  "1747083702269548"
];

let isSendingSticker = false;
const cacheDir = path.join(__dirname, 'cache');
const configFilePath = path.join(cacheDir, 'atstk.json');

// Đảm bảo thư mục cache tồn tại
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

// Đọc trạng thái từ tệp JSON khi khởi động
let autostickerConfig = {};
if (fs.existsSync(configFilePath)) {
  autostickerConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
}

// Hàm lưu trạng thái vào JSON
const saveConfig = () => {
  fs.writeFileSync(configFilePath, JSON.stringify(autostickerConfig, null, 2));
};

module.exports.handleEvent = async ({ event, api }) => {
  if (isSendingSticker || !event.body || event.senderID === api.getCurrentUserID()) return;
  
  const threadID = event.threadID;
  const autostickerEnabled = autostickerConfig[threadID] || false;

  if (autostickerEnabled) {
    let sticker = data[Math.floor(Math.random() * data.length)];
    isSendingSticker = true;
    api.sendMessage({ sticker }, threadID, () => {
      isSendingSticker = false;
    });
  }
};

module.exports.config = { 
  name: "atstk", 
  version: "1.0.0", 
  hasPermssion: 0, 
  credits: "Thanh Nguyên||TSang", 
  description: "Nghe tin nhắn và tự động gửi sticker", 
  commandCategory: "Tiện ích" 
};

module.exports.run = async ({ event, api, args }) => {
  const threadID = event.threadID;

  if (args[0] === "on") {
    autostickerConfig[threadID] = true;
    api.sendMessage("Autosticker đã được bật ✅", threadID);
  } else if (args[0] === "off") {
    autostickerConfig[threadID] = false;
    api.sendMessage("Autosticker đã được tắt ✅", threadID);
  } else {
    api.sendMessage("Sử dụng: autosticker on/off", threadID);
    return;
  }

  saveConfig();
};