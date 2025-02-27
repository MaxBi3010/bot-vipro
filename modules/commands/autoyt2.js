const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Utility: Check if a string is a valid URL
const is_url = url => /^http(s|):\/\/[^\s$.?#].[^\s]*$/i.test(url);

// Utility: Check if the URL matches specific thread patterns
const is_thread_url = url => /threads\/audio|threads/.test(url);

// Streams and caches the file locally for sending
const stream_url = async (url, type) => {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    const filePath = path.join(__dirname, 'cache', `${Date.now()}.${type}`);
    fs.writeFileSync(filePath, res.data);
    setTimeout(() => fs.unlinkSync(filePath), 1000 * 60); // Delete file after 1 minute
    return fs.createReadStream(filePath);
  } catch (error) {
    console.error('Error streaming URL:', error);
    return null; // Return null in case of error
  }
};

exports.config = {
  name: 'autothreadaudio',
  version: '10.0.1',
  hasPermssion: 3,
  credits: 'dgk',
  description: 'Download audio from thread links',
  commandCategory: 'Hệ Thống',
  usages: 'autodowntiktok',
  cooldowns: 0
};

exports.run = function (o) {};

exports.handleEvent = async function (o) {
  try {
    const a = o.event.args[0];
    const send = (msg, callback) => o.api.sendMessage(msg, o.event.threadID, callback, o.event.messageID);

    if (!is_url(a)) {
      console.log('Invalid URL');
      return;
    }

    if (is_thread_url(a)) {
      const apiURL = `https://subhatde.id.vn/threads/audio?url=${encodeURIComponent(a)}`;
      const res = await axios.get(apiURL);

      // Check if response indicates success
      if (!res.data.success) {
        console.error('Error fetching audio data: Unsuccessful response');
        return;
      }

      const audioURL = res.data.url; // Extract audio URL
      const attachment = await stream_url(audioURL, 'mp3'); // Attempt to download as MP3

      // Only send if an MP3 file was successfully downloaded
      if (attachment) {
        send(
          { 
            body: ` AUTODOWN - [ THREAD AUDIO ]\n────────────────\n`, 
            attachment 
          },
          error => {
            if (error) console.error('Error sending message:', error);
          }
        );
      } else {
        console.error('No MP3 file to send.');
      }
    }
  } catch (error) {
    console.error('Error handling event:', error);
  }
};