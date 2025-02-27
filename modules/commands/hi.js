module.exports.config = {
  name: "hi",
  version: "3.0.0",
  hasPermssion: 3,
  credit: "Vtuan",
  description: "hi gửi sticker and hinh anh",
  commandCategory: "Nhóm",
  usages: "[text]",
  cooldowns: 5
}

module.exports.handleEvent = async ({ api, event,Threads, Users }) => {
  const axios = require('axios');
	const request = require('request');
	const fs = require("fs");
  const moment = require("moment-timezone");
  var gio = moment.tz("Asia/Ho_Chi_Minh").format("D/MM/YYYY || HH:mm:ss");
  var thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
  if (thu == 'Sunday') thu = '𝐶ℎ𝑢̉ 𝑁ℎ𝑎̣̂𝑡'
  if (thu == 'Monday') thu = '𝑇ℎ𝑢̛́ 𝐻𝑎𝑖 '
  if (thu == 'Tuesday') thu = '𝑇ℎ𝑢̛́ 𝐵𝑎'
  if (thu == 'Wednesday') thu = '𝑇ℎ𝑢̛́ 𝑇𝑢̛'
  if (thu == "Thursday") thu = '𝑇ℎ𝑢̛́ 𝑁𝑎̆𝑚'
  if (thu == 'Friday') thu = '𝑇ℎ𝑢̛́ 𝑆𝑎́𝑢'
  if (thu == 'Saturday') thu = '𝑇ℎ𝑢̛́ 𝐵𝑎̉𝑦'
  let KEY = [ "helo","hi","hai","chào","chao","hí","híí","hì","hìì","lô","hii","helo","hê nhô","hehe","hlo"
  ];
  let thread = global.data.threadData.get(event.threadID) || {};
  if (typeof thread["hi"] == "undefined", thread["hi"] == false) return
  else {
  if (KEY.includes(event.body.toLowerCase()) !== false) {
    let data = ["8014255102007214","8014245182008206 ","8014252262007498","8014254115340646"     
    ];
    let sticker = data[Math.floor(Math.random() * data.length)];
    let moment = require("moment-timezone");
    let hours = moment.tz('Asia/Ho_Chi_Minh').format('HHmm');
    let data2 = [
      "Như lồn=))","Đéo vui vẻ","Đéo hạnh phúc ❤","Đéo có liềm vui 😘"
    ];
    let text = data2[Math.floor(Math.random() * data2.length)]
    let session = (
    hours > 0001 && hours <= 400 ? "Sáng tinh mơ" : 
    hours > 401 && hours <= 700 ? "Sáng sớm" :
    hours > 701 && hours <= 1000 ? "Sáng" :
    hours > 1001 && hours <= 1200 ? "trưa" : 
    hours > 1201 && hours <= 1700 ? "Chiều" : 
    hours > 1701 && hours <= 1800 ? "chiều tà" : 
    hours > 1801 && hours <= 2100 ? "tối" : 
    hours > 2101 && hours <= 2400 ? "Đêm" : 
    "lỗi");
    let name = await Users.getNameUser(event.senderID);
    let mentions = [];
    mentions.push({
      tag: name,
      id: event.senderID
    })
    const tdung = require('./../../includes/datajson/gai.json');
    var image1 = tdung[Math.floor(Math.random() * tdung.length)].trim();
    var image2 = tdung[Math.floor(Math.random() * tdung.length)].trim();
    function vtuanhihi(image,vtuandz,callback){
      request(image).pipe(fs.createWriteStream(__dirname + `/`+vtuandz)).on("close", callback);
    }
          let callback = function () {
           return api.sendMessage({
                body: `\nChào cái đéo j hả ${name}\nChúc mày 1 buổi ${session} ${text}`,
             attachment: [fs.createReadStream(__dirname + `/1.png`), fs.createReadStream(__dirname + `/2.png`)]
               }, event.threadID, () => {
                 fs.unlinkSync(__dirname + `/1.png`);
                 fs.unlinkSync(__dirname + `/2.png`);
               },event.messageID);
             };
                 vtuanhihi(image1,'1.png',()=>{vtuanhihi(image2,'2.png',callback)})
			
          let msg = {}
              api.sendMessage(msg, event.threadID, (e, info) => {
      setTimeout(() => {
        api.sendMessage({sticker: sticker}, event.threadID);
      }, 1500)
    }, event.messageID)
             }                                                                
            }
           }

module.exports.languages = {
  "vi": {
    "on": "Bật",
    "off": "Tắt",
		"successText": `${this.config.name} thành công`,
	},
	"en": {
		"on": "on",
		"off": "off",
		"successText": "success!",
	}
}

module.exports.run = async ({ event, api, Threads, getText }) => {
  let { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data;
	if (typeof data["hi"] == "undefined" || data["hi"] == true) data["hi"] = false;
	else data["hi"] = true;
	await Threads.setData(threadID, {
		data
	});
	global.data.threadData.set(threadID, data);
	return api.sendMessage(`${(data["hi"] == false) ? getText("off") : getText("on")} ${getText("successText")}`, threadID, messageID);
}
