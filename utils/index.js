
const crypto = require('crypto');
const os = require("os");
const axios = require("axios");
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const config = require('../config.json');
const package = require('../package.json');


module.exports.getYoutube = async function(t, e, i) {
    require("@distube/ytdl-core");
    const o = require("axios");
    if ("search" == e) {
      const e = require("youtube-search-api");
      return t ? a = (await e.GetListByKeyword(t, !1, 6)).items : console.log("Thiếu dữ liệu")
    }
    if ("getLink" == e) {
      var a = (await o.post("https://aiovideodl.ml/wp-json/aio-dl/video-data/", {
        url: "https://www.youtube.com/watch?v=" + t
      })).data;
        return "video" == i ? {
          title: a.title,
          duration: a.duration,
          download: {
            SD: a.medias[1].url,
            HD: a.medias[2].url
          }
        } : "audio" == i ? {
          title: a.title,
          duration: a.duration,
          download: a.medias[3].url
        } : void 0
      }
};

module.exports.throwError = function (command, threadID, messageID) {
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  return global.client.api.sendMessage(global.getText("utils", "throwError", ((threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX), command), threadID, messageID);
}

module.exports.cleanAnilistHTML = function (text) {
  text = text
    .replace('<br>', '\n')
    .replace(/<\/?(i|em)>/g, '*')
    .replace(/<\/?b>/g, '**')
    .replace(/~!|!~/g, '||')
    .replace("&amp;", "&")
    .replace("&lt;", "<")
    .replace("&gt;", ">")
    .replace("&quot;", '"')
    .replace("&#039;", "'");
  return text;
}

module.exports.downloadFile = async function (url, path) {
  const { createWriteStream } = require('fs');
  const axios = require('axios');

  const response = await axios({
    method: 'GET',
    responseType: 'stream',
    url
  });

  const writer = createWriteStream(path);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

module.exports.getContent = async function(url) {
  try {
    const axios = require("axios");

    const response = await axios({
      method: 'GET',
      url
    });

    const data = response;

    return data;
  } catch (e) { return console.log(e); };
}

module.exports.randomString = function (length) {
  var result           = '';
  var characters       = 'ABCDKCCzwKyY9rmBJGu48FrkNMro4AWtCkc1flmnopqrstuvwxyz';
  var charactersLength = characters.length || 5;
  for ( var i = 0; i < length; i++ ) result += characters.charAt(Math.floor(Math.random() * charactersLength));
  return result;
}

module.exports.AES = {
  encrypt (cryptKey, crpytIv, plainData) {
    var encipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(cryptKey), Buffer.from(crpytIv));
        var encrypted = encipher.update(plainData);
    encrypted = Buffer.concat([encrypted, encipher.final()]);
    return encrypted.toString('hex');
  },
  decrypt (cryptKey, cryptIv, encrypted) {
    encrypted = Buffer.from(encrypted, "hex");
    var decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(cryptKey), Buffer.from(cryptIv, 'binary'));
    var decrypted = decipher.update(encrypted);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return String(decrypted);
  },
  makeIv () { return Buffer.from(crypto.randomBytes(16)).toString('hex').slice(0, 16); }
}

module.exports.homeDir = function () {
  var returnHome, typeSystem;
  const home = process.env["HOME"];
  const user = process.env["LOGNAME"] || process.env["USER"] || process.env["LNAME"] || process.env["USERNAME"];

  switch (process.platform) {
    case "win32": {
      returnHome = process.env.USERPROFILE || process.env.HOMEDRIVE + process.env.HOMEPATH || home || null;
      typeSystem = "win32"
      break;
    }
    case "darwin": {
      returnHome = home || (user ? '/Users/' + user : null);
      typeSystem = "darwin";
      break;
    }
    case "linux": {
      returnHome =  home || (process.getuid() === 0 ? '/root' : (user ? '/home/' + user : null));
      typeSystem = "linux"
      break;
    }
    default: {
      returnHome = home || null;
      typeSystem = "unknow"
      break;
    }
  }

  return [typeof os.homedir === 'function' ? os.homedir() : returnHome, typeSystem];
}

module.exports.removeBackground = async(image) => {
  if(!image) return console.log('RemoveBG: thiếu dữ liệu');
  var resolveFunc = function () { };
    var rejectFunc = function () { };
    var returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

  const path = resolve(__dirname, 'cache', `${Date.now()}.jpg`);
  const newPath = resolve(__dirname, 'cache', `${Date.now() + 1000}.jpg`);
  await global.utils.downloadFile(image, path);
  var formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', createReadStream(path), basename(path));
  var key = [
    'a58an6Ka7ZB1fwHtJ4kKaieb',
    'kzqQMXdxTqVDuS1S91KG54Sj',
    'SAdj4BtGWK2nPU8QiYDXrJRT',
    'MxoPFvx7QemG7JcDVB7azogp',
    'adyJwSQHJ3qWK2iwzj1LEQEQ',
    '7b6boYMmPiCg5t2SabBFHWdF']
  axios({
      method: 'post',
      url: 'https://api.remove.bg/v1.0/removebg',
      data: formData,
      responseType: 'arraybuffer',
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': key[Math.floor(Math.random() * key.length)],
      },
      encoding: null
  })
  .then((response) => {
      if(response.status != 200) return rejectFunc()
      writeFileSync(newPath, response.data);
      unlinkSync(path)
      resolveFunc(newPath)
  })
  .catch((error) => {
    return rejectFunc(error)
  });
  return returnPromise;
        }

module.exports.getStream = async function (url, type = "stream") {
  const response = await axios({
    method: 'GET',
    responseType: type,
    url
  });
  return response.data;
};

module.exports.imgur = async (url, type) => {
  const imgur = require("imgur");
  const ClientID = "4bc7f0dbff47809";
  imgur.setClientId(ClientID);
  const pathSave = __dirname + `/../modules/commands/cache/${Date.now()}.${type}`;
  const { downloadFile } = global.utils;
  await downloadFile(url, pathSave);
  const uploadPromise = imgur.uploadFile(pathSave);
  const getLink = await uploadPromise;
  const link = getLink.link;
  fs.unlinkSync(pathSave);
  return link;
};
module.exports.catbox = async function(link) {
try {
  const { headers } = await axios.head(link);
  const contentType = headers['content-type'];
  const extension = contentType.split('/')[1] || 'bin';
  const filePath = path.join(process.cwd(), 'modules', 'commands', 'cache', `${Date.now()}.${extension}`);
  const response = await axios({ method: 'GET', url: link, responseType: 'stream' });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  await new Promise((resolve, reject) => writer.on('finish', resolve).on('error', reject));
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', fs.createReadStream(filePath));
  const { data } = await axios.post('https://catbox.moe/user/api.php', formData, {
    headers: formData.getHeaders(),
  });
  fs.unlinkSync(filePath);
  return data;
  } catch (error) {
    throw new Error(`Error uploading catbox:`, error);
  }
}