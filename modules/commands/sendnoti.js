const fs = require('fs');
const request = require('request');

module.exports.config = {
    name: "thongbao",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "TruongMini, mod by NCQB và Magus",
    description: "",
    commandCategory: "Tiện ích",
    usages: "[msg]",
    cooldowns: 5,
}

let atmDir = [];

const getAtm = (atm, body) => new Promise(async (resolve) => {
    let msg = {}, attachment = [];
    msg.body = body;
    for(let eachAtm of atm) {
        await new Promise(async (resolve) => {
            try {
                let response =  await request.get(eachAtm.url),
                    pathName = response.uri.pathname,
                    ext = pathName.substring(pathName.lastIndexOf(".") + 1),
                    path = __dirname + `/cache/${eachAtm.filename}.${ext}`
                response
                    .pipe(fs.createWriteStream(path))
                    .on("close", () => {
                        attachment.push(fs.createReadStream(path));
                        atmDir.push(path);
                        resolve();
                    })
            } catch(e) { console.log(e); }
        })
    }
    msg.attachment = attachment;
    resolve(msg);
})

module.exports.handleReply = async function ({ api, event, handleReply, Users, Threads }) {
    const moment = require("moment-timezone");
    const gio = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY - HH:mm:ss");
    const { threadID, senderID, body } = event;
    const name = await Users.getNameUser(senderID);
    const fbLink = `https://www.facebook.com/${senderID}`;
    const threadName = (await Threads.getInfo(threadID)).threadName || "Unknown";

    switch (handleReply.type) {
        case "sendnoti": {
            let text = `====== [ 𝗣𝗵𝗮̉𝗻 𝗵𝗼̂̀𝗶 𝘁𝘂̛̀ 𝗨𝘀𝗲𝗿 ] ======\n` +
                `--------------\n` +
                `🕗 ${gio}\n` +
                `--------------\n` +
                `💬 : ${body}\n` +
                `--------------\n` +
                `👤 : ${name}\n` +
                `🔗 : ${fbLink}\n` +
                `--------------\n` +
                `🏠 : ${threadName}\n` +
                `📶 : ${threadID}`;

            if (event.attachments.length > 0) {
                text = await getAtm(event.attachments, text);
            }

            api.sendMessage(text, handleReply.threadID, (err, info) => {
                atmDir.forEach(each => fs.unlinkSync(each));
                atmDir = [];
                global.client.handleReply.push({
                    name: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    messID: event.messageID,
                    threadID
                });
            });
            break;
        }

        case "reply": {
            let text = `==== [𝑷𝒉𝒂̉𝒏 𝒉𝒐̂̀𝒊 𝒕𝒖̛̀ 𝑨𝑫𝑴𝑰𝑵 ] ====\n` +
                `--------------\n` +
                `🕗 : ${gio}\n` +
                `--------------\n` +
                `💬 : ${body}\n` +
                `--------------\n` +
                `🧛 : ${name} - 𝑪𝒖𝒕𝒊𝒆\n` +
                `🔗 : ${fbLink}\n` +
                `--------------\n` +
                `🏠 : ${threadName}\n` +
                `📶 : ${threadID}`;

            if (event.attachments.length > 0) {
                text = await getAtm(event.attachments, text);
            }

            api.sendMessage(text, handleReply.threadID, (err, info) => {
                atmDir.forEach(each => fs.unlinkSync(each));
                atmDir = [];
                global.client.handleReply.push({
                    name: this.config.name,
                    type: "sendnoti",
                    messageID: info.messageID,
                    threadID
                });
            }, handleReply.messID);
            break;
        }

        case "sendid": {
            const targetID = body.split(" ")[0]; // ID nhóm lấy từ tin nhắn
            const message = body.slice(targetID.length + 1); // Nội dung gửi đi

            if (!targetID || isNaN(targetID)) {
                return api.sendMessage("ID nhóm không hợp lệ.", threadID);
            }

            let text = `==== [ 𝗧𝗵𝗼̂𝗻𝗴 𝗯𝗮́𝗼 𝘁𝘂̛̀ 𝗔𝗱𝗺𝗶𝗻 ] ====\n` +
                `--------------\n` +
                `『𝗧𝗶𝗺𝗲』: ${gio}\n` +
                `--------------\n` +
                `『𝗡𝗼̣̂𝗶 𝗱𝘂𝗻𝗴』: ${message}\n` +
                `『𝗧𝘂̛̀ 𝗔𝗱𝗺𝗶𝗻』: ${name}\n` +
                `『𝗟𝗶𝗻𝗸 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸』: ${fbLink}`;

            api.sendMessage(text, targetID, (err) => {
                if (err) return api.sendMessage(`Không thể gửi thông báo đến nhóm ID: ${targetID}`, threadID);
                api.sendMessage(`Đã gửi thông báo đến nhóm ID: ${targetID}`, threadID);
            });
            break;
        }
    }
}
module.exports.run = async function ({ api, event, args, Users }) {
    const moment = require("moment-timezone");
      var gio = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY - HH:mm:s");
    const { threadID, messageID, senderID, messageReply } = event;
    if (!args[0]) return api.sendMessage("Please input message", threadID);
    let allThread = global.data.allThreadID || [];
    let can = 0, canNot = 0;
    let text = `====== [ 𝑻𝒉𝒐̂𝒏𝒈 𝒃𝒂́𝒐 ] ======\n--------------\n🕗 : ${gio}\n\n--------------\n💬 : ${args.join(" ")}\n\n--------------\n🧛 : ${await Users.getNameUser(senderID)} \n--------------\n𝑹𝒆𝒑𝒍𝒚 𝒕𝒊𝒏 𝒏𝒉𝒂̆́𝒏 => 𝒈𝒖̛̉𝒊 𝒗𝒆̂̀ 𝒂𝒅𝒎𝒊𝒏`;
    if(event.type == "message_reply") text = await getAtm(messageReply.attachments, `====== [ 𝑻𝒉𝒐̂𝒏𝒈 𝒃𝒂́𝒐 ] ======\n--------------\n🕗 : ${gio}\n\n--------------\n💬 : ${args.join(" ")}\n\n--------------\n🧛 ${await Users.getNameUser(senderID)}\n--------------\n𝑹𝒆𝒑𝒍𝒚 𝒕𝒊𝒏 𝒏𝒉𝒂̆́𝒏 => 𝒈𝒖̛̉𝒊 𝒗𝒆̂̀ 𝒂𝒅𝒎𝒊𝒏`);
    await new Promise(resolve => {
        allThread.forEach((each) => {
            try {
                api.sendMessage(text, each, (err, info) => {
                    if(err) { canNot++; }
                    else {
                        can++;
                        atmDir.forEach(each => fs.unlinkSync(each))
                        atmDir = [];
                        global.client.handleReply.push({
                            name: this.config.name,
                            type: "sendnoti",
                            messageID: info.messageID,
                            messID: messageID,
                            threadID
                        })
                        resolve();
                    }
                })
            } catch(e) { console.log(e) }
        })
    })
    api.sendMessage(`đã gửi đến  ${can} nhóm, không thể gửi đến ${canNot} nhòm`, threadID);
  }
                    