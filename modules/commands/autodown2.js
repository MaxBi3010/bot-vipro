const fs = require('fs');
const axios = require('axios');
const qs = require('qs');
const path = require('path');
const autoPath = path.join(__dirname, 'cache/auto.json');

if (!fs.existsSync(autoPath)) {
  fs.writeFileSync(autoPath, JSON.stringify({}, null, 4), 'utf8');
}

async function fbdown2(url) {
  try {
    const getToken = (await axios.get("https://fdownloader.net")).data;
    const k_exp = getToken.split('k_exp="')[1].split('"')[0];
    const k_token = getToken.split('k_token="')[1].split('"')[0];
    const data = qs.stringify({
      'k_exp': k_exp,
      'k_token': k_token,
      'q': url
    });
    const config = {
      method: 'post',
      url: 'https://v3.fdownloader.net/api/ajaxSearch?lang=en',
      headers: {
        "Accept": "*/*",
        "Origin": "https://fdownloader.net",
        "Referer": "https://fdownloader.net/",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded",
        "Sec-Ch-Ua": '"Not/A)Brand";v="99", "Microsoft Edge";v="115", "Chromium";v="115"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.183",
        "X-Requested-With": "XMLHttpRequest",
      },
      data: data
    };
    const res = await axios(config);
    const dataContent = res.data.data;
    const thumb = dataContent.split('<img src="')[1].split('">')[0].replace(/;/g, "&");
    const time = dataContent.split('clearfix')[1].split('<p>')[1].split("</p>")[0];
    const HD = dataContent.split('" rel="nofollow"')[0].split('<td>No</td>')[1].split('"')[1].replace(/;/g, "&");
    return {
      duration: time,
      thumb: thumb,
      url: HD
    };
  } catch (e) {
    return 'Lỗi';
  }
}

module.exports = class {
  static config = {
    name: "atd",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "KyPhan",
    description: "Bật/tắt tải video tự động theo nhóm",
    commandCategory: "Tiện ích",
    usages: "[on/off]",
    cooldowns: 5
  };

  static async run({ event, args, api }) {
    const { threadID, messageID } = event;
    const autoConfig = JSON.parse(fs.readFileSync(autoPath, 'utf8'));
    const state = args[0]?.toLowerCase();

    if (state === "on") {
      autoConfig[threadID] = true;
      fs.writeFileSync(autoPath, JSON.stringify(autoConfig, null, 4), 'utf8');
      return api.sendMessage("Autodown đã được bật cho nhóm này!", threadID, messageID);
    } else if (state === "off") {
      autoConfig[threadID] = false;
      fs.writeFileSync(autoPath, JSON.stringify(autoConfig, null, 4), 'utf8');
      return api.sendMessage("Autodown đã được tắt cho nhóm này!", threadID, messageID);
    } else {
      return api.sendMessage("Vui lòng sử dụng: atd on hoặc atd off.", threadID, messageID);
    }
  }

  static check_url(url) {
    return /^https:\/\//.test(url);
  }

  static regext_url(type) {
    switch (type) {
      case "facebook":
        return /^https:\/\/www\.facebook\.com\/share\/[a-zA-Z0-9]+\/$/;
    }
  }

  static async streamURL(url, type) {
    return axios.get(url, { responseType: 'arraybuffer' }).then(res => {
      const path = __dirname + `/cache/${Date.now()}.${type}`;
      fs.writeFileSync(path, res.data);
      setTimeout(p => fs.unlinkSync(p), 1000 * 60, path);
      return fs.createReadStream(path);
    });
  }

  static async handleEvent(o) {
    const { threadID: t, messageID: m, body: b } = o.event;
    const send = (msg, callback) => o.api.sendMessage(msg, t, callback, m);
    const head = t => `[ AUTODOWN - ${t} ]\n──────────────────`;

    const autoConfig = JSON.parse(fs.readFileSync(autoPath, 'utf8'));
    if (!autoConfig[t]) return;

    if (this.check_url(b)) {
      if (this.regext_url("facebook").test(b)) {
        const result = await fbdown2(b);
        if (result === 'Lỗi') {
          return console.log(`${head('ERROR')}\n⩺ Không thể tải video từ link này.`);
        }
        const { duration, thumb, url } = result;
        const attachment = [await this.streamURL(url, "mp4")];
        send({
          body: `${head('FACEBOOK')}\n⩺ Tiêu Đề: Video Facebook\n⩺ Thời lượng: ${duration}`,
          attachment
        });
      }
    }
  }
};