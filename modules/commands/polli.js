exports.config = {
  name: "polli",
  version: "0.0.9",
  hasPermssion: 0,
  credits: "Hải harin",
  description: "vẽ ảnh ai thông qua web pollination",
  commandCategory: "Tiện ích",
  usages: "{prefix} + {name} + {nội dung}",
  cooldowns: 5,
};

exports.run = async (o) => {
  let { threadID, messageID } = o.event;
  const msg = o.args.join(" ")
  if(!msg) return o.api.sendMessage("Bạn vui lòng nhập nội dung để vẽ!", threadID, messageID)
  const axios = require("axios"), fs = require("fs")
  o.api.sendMessage("Đang tiến hành tạo ảnh, vui lòng chờ...\nTin nhắn sẽ tự động gỡ sau 15s(tính từ lúc sử dụng lệnh)", threadID, (err, info) =>
  setTimeout(() => { o.api.unsendMessage(info.messageID) } , 15 * 1000))
  const stream = (await axios.get(encodeURI(`https://image.pollinations.ai/prompt/${msg}`), { responseType: "arraybuffer" })).data 
  var path = __dirname + `/cache/22.jpg`;
  fs.writeFileSync(path, Buffer.from(stream, "utf-8"));
  o.api.sendMessage({ body: "Đã hoàn thành xong ảnh bạn yêu cầu!", attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID)
    }
