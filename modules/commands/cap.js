const axios = require('axios');
const fs = require('fs-extra');

const cookiePath = __dirname + '/cache/cookie.json';
const appstatePath = __dirname + "/../../appstate.json";  

module.exports = {
    config: {
        name: "cap",
        version: "1.3.0",
        description: "Chụp ảnh TCN Facebook từ link, tag hoặc tự động của người dùng lệnh, hoặc chụp ảnh website từ link HTTP/HTTPS",
        commandCategory: "Tiện ích",
        usages: "[link Facebook hoặc website] hoặc [tag người dùng] hoặc không nhập gì",
        cooldowns: 5,
    },

    onLoad: () => {
        if (!fs.existsSync(cookiePath)) {
            console.log("⚠️ File cookie không tồn tại. Hãy thêm file cookie hợp lệ vào cache.");
        }

        if (!fs.existsSync(cookiePath)) {
            const appstate = require(appstatePath);  
            const result = appstate.map(cc => `${cc.key}=${cc.value}`).join(";"); 

            const data = JSON.stringify({ cookie: result }, null, 2);
            fs.writeFileSync(cookiePath, data); // Lưu vào cache/cookie.json
        }
    },

    run: async ({ api, event, args, Users }) => {
        const { threadID, messageID, senderID, mentions, messageReply } = event;

        const apiflashKey = "d3f1c47bdc694174bbebda2810ed6acd"; // Thay bằng key API Apiflash.com
        const imagePath = __dirname + "/cache/fbCap.png";

        
        const cookieData = JSON.parse(fs.readFileSync(cookiePath, "utf8")).cookie;

        
        let targetUserID = senderID; 
        let targetUserName = await Users.getNameUser(targetUserID);

        
        let mentionsData = [];
        if (mentions && Object.keys(mentions).length > 0) {
            mentionsData = [];
            for (let userID of Object.keys(mentions)) {
                const name = await Users.getNameUser(userID);
                mentionsData.push({
                    tag: name,
                    id: userID
                });
                targetUserID = userID;  
                targetUserName = name;  
            }
        }
        
        else if (messageReply) {
            targetUserID = messageReply.senderID;
            targetUserName = await Users.getNameUser(targetUserID);
        }

        
        if (!targetUserName) {
            targetUserName = await Users.getNameUser(targetUserID);
        }

        if (!targetUserName) {
            return api.sendMessage("❎ Không xác định được người dùng. Vui lòng thử lại!", threadID, messageID);
        }

        const linkInput = args[0];
        if (/^https?:\/\/.+/.test(linkInput)) {
            api.sendMessage(`🔄 Đang chụp ảnh từ website: ${linkInput}, vui lòng chờ...`, threadID, messageID);

            try {
               const screenshotURL = `https://api.apiflash.com/v1/urltoimage?access_key=${apiflashKey}&url=${encodeURIComponent(linkInput)}&format=png&width=1200&height=800&quality=80&cookies=${encodeURIComponent(cookieData)}`;
                const screenshotData = (await axios.get(screenshotURL, { responseType: "arraybuffer" })).data;

                fs.writeFileSync(imagePath, screenshotData);

                return api.sendMessage(
                    {
                        body: `✅ Đã chụp ảnh từ website: ${linkInput}`,
                        attachment: fs.createReadStream(imagePath),
                    },
                    threadID,
                    () => fs.unlinkSync(imagePath),
                    messageID
                );
            } catch (error) {
                console.error(error);
                return api.sendMessage(`❎ Lỗi con mẹ mày rồi: ${error.message}`, threadID, messageID);
            }
        }

        api.sendMessage(`🔄 Đang xử lý ảnh TCN của ${targetUserName}, vui lòng chờ...`, threadID, messageID);

        try {
            const profileLink = `https://www.facebook.com/${targetUserID}`;
            const screenshotURL = `https://api.apiflash.com/v1/urltoimage?access_key=${apiflashKey}&url=${encodeURIComponent(profileLink)}&format=png&width=1200&height=800&quality=80&cookies=${encodeURIComponent(cookieData)}`;
            const screenshotData = (await axios.get(screenshotURL, { responseType: "arraybuffer" })).data;

            fs.writeFileSync(imagePath, screenshotData);

            return api.sendMessage(
                {
                    body: `✅ Đã chụp ảnh TCN của: ${targetUserName}`,
                    attachment: fs.createReadStream(imagePath),
                },
                threadID,
                () => fs.unlinkSync(imagePath),
                messageID
            );
        } catch (error) {
            console.error(error);
            return api.sendMessage(`❌ Lỗi khi chụp ảnh: ${error.message}`, threadID, messageID);
        }
    },
};