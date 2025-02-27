const fs = require("fs-extra");
const axios = require('axios').default;
const FormData = require('form-data');
const path = require('path');

module.exports.config = {
  name: "gta5",
  version: "1.2.9",
  hasPermssion: 0,
  credits: "Dongv",
  description: " Chuyển ảnh thường thành ảnh game GTA 5",
  commandCategory: "Người dùng",
  usages: "[reply]",
  cooldowns: 0
};

const gtav = async (url) => {
  const getRandomValue = () => Math.random().toString(36).substring(2);
  const generateCookies = () => 
    `_ga=GA1.1.${getRandomValue()}.${getRandomValue()}; ` +
    `__eoi=ID=${getRandomValue()}:T=${getRandomValue()}:RT=${getRandomValue()}:S=${getRandomValue()}; ` +
    `_ga_WBHK34L0J9=GS1.1.${getRandomValue()}.1.0.${getRandomValue()}.0.0.0; ` +
    `FCNEC=%5B%5B%22AKsRol${getRandomValue()}${getRandomValue()}${getRandomValue()}%3D%3D%22%5D%5D`;

  const downloadImage = async (imageUrl, outputPath) => {
    const response = await axios({ url: imageUrl, method: 'GET', responseType: 'stream' });
    return new Promise((resolve, reject) => {
      response.data.pipe(fs.createWriteStream(outputPath)).on('finish', resolve).on('error', reject);
    });
  };

  const getId = async (imageUrl) => {
    const imagePath = path.join(__dirname, `cache/${Date.now()}.jpg`);
    await downloadImage(imageUrl, imagePath);

    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));

    const headers = {
      ...form.getHeaders(),
      'Accept': '*/*',
      'Cookie': generateCookies(),
      'User-Agent': 'Mozilla/5.0',
    };

    try {
      const response = await axios.post('https://taoanhdep.com/public/anime-gtav.php', form, { headers });

      if (response.data.status === "OK" && response.data.requestId) {
        return response.data.requestId;
      } else {
        console.error('Invalid response from upload API:', response.data);
        throw new Error('Invalid response from upload API');
      }
    } catch (error) {
      console.error('Error getting ID:', error);
      throw new Error('Could not get ID from API');
    }
  };

  const id = await getId(url);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const headers = {
    'Accept': '*/*',
    'Cookie': generateCookies(),
    'User-Agent': 'Mozilla/5.0',
  };

  let responseData, status = 'InProgress';

  while (status === 'InProgress') {
    try {
      await delay(5000);
      const response = await axios.get(`https://taoanhdep.com/public/check-gtav.php?id=${id}`, { headers });
      responseData = response.data;

      console.log('Response data from check-gtav:', responseData);

      status = responseData.status;

      if (status === 'InProgress') await delay(10000);
    } catch (error) {
      console.error('Error checking image status:', error);
      status = 'error';
    }
  }

  if (responseData && responseData.result_url) {
    return responseData.result_url;
  } else {
    console.error('Failed to retrieve image URL:', responseData);
    throw new Error('Failed to retrieve image URL from response data. Response data: ' + JSON.stringify(responseData));
  }
};

module.exports.run = async function({ api, event, args }) {
  let linkUp;

  if (event.messageReply && event.messageReply.attachments.length > 0) {
    linkUp = event.messageReply.attachments[0].url;
  } else if (args[0] && /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(args[0])) {
    linkUp = args[0];
  }

  if (!linkUp) {
    return api.sendMessage('Vui lòng reply 1 ảnh hoặc nhập link ảnh!', event.threadID, event.messageID);
  }

  try {
    const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    if (!urlPattern.test(linkUp)) {
      return api.sendMessage('URL không hợp lệ!', event.threadID, event.messageID);
    }

    api.sendMessage("🔄 Đang load, chờ tí nhé....!", event.threadID);

    const imageUrl = await gtav(linkUp);

    if (!imageUrl) {
      return api.sendMessage('❎️ Không thể nhận được URL ảnh!', event.threadID, event.messageID);
    }

    const filePath = path.join(__dirname, `cache/${Date.now()}.png`);
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, response.data);

    return api.sendMessage({
      body: `✅`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
  } catch (e) {
    console.error(e);
    return api.sendMessage(`❌️ : ${e.message}`, event.threadID, event.messageID);
  }
};