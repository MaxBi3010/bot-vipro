const fs = require('fs');
const path = require('path');
const moment = require("moment-timezone");
let tip;
let validLinks;
let dataPath;
let reactionStatus = null;

module.exports.config = {
  name: "upapi",
  version: "1.2.9",
  hasPermission: 3,
  credits: "DongDev",
  description: "Publish data vào src api",
  commandCategory: "Admin",
  usages: "[]",
  usePrefix: false,
  cooldowns: 5
};

function validURL(str) {
  const pattern = new RegExp('^(https?|ftp):\\/\\/' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$', 'i');
  return pattern.test(str);
}

function isValidFileType(link) {
  const allowedExtensions = ['.mp4', '.mp3', '.jpeg', '.png', '.gif', '.jpg', '.m4a', '.mpga'];
  const ext = path.extname(link);
  return allowedExtensions.includes(ext.toLowerCase());
}

module.exports.run = async ({ api, event, args }) => {
  try {
    const Tm = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || DD/MM/YYYY');
    const projectHome = path.resolve('./');
    const srcapi = path.join(projectHome, 'includes/datajson');

    if (args.length < 2) {
      return api.sendMessage(`${module.exports.config.name} + namefile + link`, event.threadID, event.messageID);
  }

    tip = args[0];
    dataPath = path.join(srcapi, `${tip}.json`);
    if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '[]', 'utf-8');

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const links = args.slice(1);
    validLinks = links.filter(link => validURL(link.trim()) && isValidFileType(link.trim()) && !data.includes(link.trim()));

    if (validLinks.length === 0) {
      return api.sendMessage(`⚠️ Không có liên kết hợp lệ để thêm vào hệ thống.`, event.threadID, event.messageID);
    }

    api.sendMessage(`[ PUBLISH DATA IN SRC API ]\n───────────────\n☑️ Kiểm tra thành công\n📝 Có ${validLinks.length} liên kết hợp lệ để thêm vào ${tip}.json\n\n📌 Bạn có muốn publish vào API không?\n───────────────\n👉 Thả "😆" Để publish link vào api\n👉 Thả "👍" để hủy bỏ hành động\n───────────────\n⏰ Time: ${Tm}`, event.threadID).then(async (info) => {
      global.client.handleReaction.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: event.senderID,
      });
      reactionStatus = info.messageID;
    }).catch((err) => {
      api.sendMessage(`❎ Đã xảy ra lỗi khi gửi tin nhắn: ${JSON.stringify(err)}`, event.senderID);
    });
  } catch (error) {
    console.log(error);
    api.sendMessage(`❎ Đã xảy ra lỗi trong quá trình thực hiện lệnh: ${error}`, event.threadID);
  }
};

module.exports.handleReaction = async ({ event, api }) => {
  try {
    const Tm = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || DD/MM/YYYY');
    const { threadID, reaction } = event;

    if (reactionStatus && event.messageID === reactionStatus) {
      if (reaction === '😆' && dataPath) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        Array.prototype.push.apply(data, validLinks);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

        api.unsendMessage(event.messageID);
        api.sendMessage(`[ PUBLISH DATA IN SRC API ]\n───────────────\n🔐 Kết Quả: Thành công ☑️\n📎 Đã thực hiện publish ${validLinks.length} link vào file ${tip}.json\n───────────────\n⏰ Time: ${Tm}`, threadID);
      } else if (reaction === '👍') {
        api.unsendMessage(event.messageID);
        api.sendMessage(`[ PUBLISH DATA IN SRC API ]\n───────────────\n🔐 Hủy bỏ publish liên kết thành công ☑️\n⏰ Time: ${Tm}`, threadID);
       }
      reactionStatus = null;
    }
  } catch (error) {
    console.error(error);
    const errorMessage = `[ PUBLISH DATA IN SRC API ]\n───────────────\n🔐 Kết Quả: Thất bại ❎\n⚠️ Đã xảy ra lỗi: ${error.message}`;
    api.sendMessage(errorMessage, event.threadID);
  }
};
