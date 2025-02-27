module.exports.config = {
  name: "uid",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Dgk",
  description: "Lấy ID người dùng, tên và ngày gia nhập của người dùng Facebook.",
  commandCategory: "Người dùng",
  usePrefix: false,
  cooldowns: 0
};

const axios = require("axios");
const downloader = require('image-downloader');
const fse = require('fs-extra');

async function streamURL(url, mime = 'jpg') {
  const dest = `${__dirname}/cache/${Date.now()}.${mime}`;
  await downloader.image({ url, dest });
  setTimeout(() => fse.unlinkSync(dest), 60 * 1000);
  return fse.createReadStream(dest);
}

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  if (args[0] === "box") { 
    const boxID = event.threadID;
    const threadInfo = await api.getThreadInfo(boxID);

    if (threadInfo.imageSrc) { 
   const boxImage = await streamURL(threadInfo.imageSrc);
      return api.sendMessage({ body: `ID của box này là: ${boxID}`, attachment: boxImage }, threadID, messageID);
    } else {
      return api.sendMessage(`ID của box là: ${boxID}`, threadID, messageID);
    }
  }

  if (event.type === "message_reply") {
    const uid = event.messageReply.senderID;
    try {
      const response = await axios.get(`https://lechii.onrender.com/facebook/timejoin?uid=${uid}`);
      if (response.data) {
        const { name, day, time } = response.data;
        const userImage = await streamURL(`https://graph.facebook.com/${uid}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        return api.sendMessage({
          body: `Tên: ${name}\nID: ${uid}\nNgày gia nhập: ${day}\nThời gian gia nhập: ${time}`,
          attachment: userImage
        }, threadID, messageID);
      } else {
        return api.sendMessage("⚠️ Không thể lấy thông tin từ người dùng này.", threadID, messageID);
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage("⚠️ Đã xảy ra lỗi trong quá trình lấy thông tin.", threadID, messageID);
    }
  }

  if (!args[0]) {
    const userID = event.senderID;
    try {
      const response = await axios.get(`https://lechii.onrender.com/facebook/timejoin?uid=${userID}`);
      if (response.data) {
        const { name, day, time } = response.data;
        const userImage = await streamURL(`https://graph.facebook.com/${userID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        return api.sendMessage({
          body: `Tên: ${name}\nID: ${userID}\nTime join: ${day}\nTime : ${time}`,
          attachment: userImage
        }, threadID, messageID);
      } else {
        return api.sendMessage("⚠️ Không thể lấy thông tin người dùng này.", threadID, messageID);
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage("⚠️ Đã xảy ra lỗi trong quá trình lấy thông tin.", threadID, messageID);
    }
  }

  if (args[0].indexOf(".com/") !== -1) {
    try {
        const link = args[0]; 
        const response = await axios.get(`https://ffb.vn/api/tool/get-id-fb?idfb=${encodeURIComponent(link)}`);
        
        if (response.data.error === 0) {
            const uid = response.data.id;

            // Kiểm tra link share Facebook
            if (link.includes("/share/")) {
                // Xử lý link share
                return api.sendMessage(`ID: ${uid}\nLink share được xử lý.`, threadID, messageID);
            } 

            
            if (
                link.includes("/profile.php?id=") || 
                link.includes("/profile.php") || 
                /facebook\.com\/[\w\.]+(\?|$)/.test(link) // Kiểm tra link profile với username
            ) {
                const userInfo = await axios.get(`https://lechii.onrender.com/facebook/timejoin?uid=${uid}`);
                if (userInfo.data) {
                    const { day, time } = userInfo.data;
                    const userImage = await streamURL(`https://graph.facebook.com/${uid}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

                    return api.sendMessage({
                        body: `ID: ${uid}\nTime join: ${day}\nTime: ${time}`,
                        attachment: userImage
                    }, threadID, messageID);
                } else {
                    return api.sendMessage("⚠️ Không thể lấy thông tin người dùng.", threadID, messageID);
                }
            }

            
            if (
                link.includes("/posts/") || 
                link.includes("/permalink/") || 
                link.includes("/story.php")
            ) {
                
                return api.sendMessage(`ID: ${uid}`, threadID, messageID);
            }

        } else {
            return api.sendMessage("⚠️ Không thể lấy ID từ link.", threadID, messageID);
        }
    } catch (error) {
        console.error(error);
        return api.sendMessage("⚠️ Đã xảy ra lỗi trong quá trình xử lý.", threadID, messageID);
    }
}


for (const [id, name] of Object.entries(event.mentions)) {
    try {
        const userImage = await streamURL(`https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        const userInfo = await axios.get(`https://lechii.onrender.com/facebook/timejoin?uid=${id}`);
        const { day, time } = userInfo.data || {};

        await api.sendMessage({
            body: `${name.replace('@', '')}: ${id}\nTime join: ${day || "Không tìm thấy ngày gia nhập"}\nTime: ${time || "Không tìm thấy thời gian"}`,
            attachment: userImage
        }, threadID);
    } catch (error) {
        console.error(error);
        await api.sendMessage(`⚠️ Đã xảy ra lỗi khi xử lý người dùng: ${name}`, threadID);
    }
}};