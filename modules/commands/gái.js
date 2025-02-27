module.exports.config = {
  name: "gái",	
  version: "4.0.0", 
  hasPermssion: 0,
  credits: "Vtuan",
  description: "sos", 
  commandCategory: "Người dùng",
  usages: "",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event, Threads }) {
  const request = require('request');
  const fs = require("fs");
var thinh = global.api("poem", "datajson");
  var { threadID, messageID, body } = event;
  const tdungs = [
    require('./../../includes/datajson/gai.json'),
    require('./../../includes/datajson/gai.json'),
 require('./../../includes/datajson/gai.json'),
    require('./../../includes/datajson/gai.json'),
 require('./../../includes/datajson/gai.json'),
    require('./../../includes/datajson/gai.json'),
 require('./../../includes/datajson/gai.json')    
  ];

  function vtuanhihi(image, vtuandz, callback) {
    request(image).pipe(fs.createWriteStream(__dirname + `/` + vtuandz)).on("close", callback);
  }

  if (body.toLowerCase() == "gái" || (body.toLowerCase() == "Gái")) {
    const numImages = Math.floor(Math.random() * 10) + 3; // Random từ 1 đến 10
    let imagesDownloaded = 0;
    let attachments = [];

    for (let i = 0; i < numImages; i++) {
      const randomTdung = tdungs[Math.floor(Math.random() * tdungs.length)];
      let image = randomTdung[Math.floor(Math.random() * randomTdung.length)].trim();
      let imgFileName = `image_${i}.png`;
      vtuanhihi(image, imgFileName, () => {
          imagesDownloaded++;
          attachments.push(fs.createReadStream(__dirname + `/${imgFileName}`));
          if (imagesDownloaded === numImages) {
            api.sendMessage({
              body: `\n🦑${thinh}\n`,
              attachment: attachments
            }, event.threadID, () => {

              for (let img of attachments) {
                fs.unlinkSync(img.path); 
              }
            }, event.messageID);
          }
      });
    }
  }
}

module.exports.run = async ({ api, event, args, Threads }) => {}