module.exports.config = {
  name: "lyrics",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Jukie~",
  description: "Lyrics from nhaccuatui",
  commandCategory: "Người dùng",
  usages: "lyrics [name of the song]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  let song = args.join(" ");
  const res = await axios.get(`https://joshweb.click/api/findsong?lyrics=${song}`);
  
  // Extracting the data from the API response
  const title = res.data.result.title;
  const album = res.data.result.album;
  const lyrics = res.data.result.lyrics;
  const image = res.data.result.thumb;
  
  // Downloading the image
  const download = (await axios.get(image, { responseType: "stream" })).data;
  
  // Sending the message with lyrics and image
  return api.sendMessage({
    body: `Title: ${title}\nAlbum: ${album}\n\nLyrics:\n${lyrics}`,
    attachment: download
  }, event.threadID, event.messageID);
};