const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const qs = require("qs");
async function search(keyWord) {
    try {
        const res = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(keyWord)}`);
        const getJson = JSON.parse(res.data.split("ytInitialData = ")[1].split(";</script>")[0]);
        const videos = getJson.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
        const results = [];
        for (const video of videos)
            if (video.videoRenderer?.lengthText?.simpleText)
                results.push({
                    id: video.videoRenderer.videoId,
                    title: video.videoRenderer.title.runs[0].text,
                    thumbnail: video.videoRenderer.thumbnail.thumbnails.pop().url,
                    time: video.videoRenderer.lengthText.simpleText,
                    channel: {
                        id: video.videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                        name: video.videoRenderer.ownerText.runs[0].text,
                        thumbnail: video.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails.pop().url.replace(/s[0-9]+\-c/g, '-c')
                    }
                });
        return results;
    } catch (e) {
        const error = new Error("Cannot search video");
        error.code = "SEARCH_VIDEO_ERROR";
        throw error;
    }
}
async function getData(id) {
    try {
        function formatNumber(number) {
            if (isNaN(number)) {
                return null;
            }
            return number.toLocaleString('de-DE');
        }
        async function getInfo(id) {
            try {
                const { data } = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
                    params: {
                        id: id,
                        key: 'AIzaSyDp7rbDJT_L60Yrj55mTCfov2eEfXQVwYA',
                        part: 'snippet,contentDetails,statistics'
                    }
                });
                if (!data.items || data.items.length === 0) {
                    throw new Error('Video data not found');
                }
                const res = data.items[0];
                return {
                    id: res.id,
                    title: res.snippet.title,
                    author: res.snippet.channelTitle,
                    views: formatNumber(res.statistics.viewCount) || 0,
                    likes: formatNumber(res.statistics.likeCount) || 0,
                    favorites: formatNumber(res.statistics.favoriteCount) || 0,
                    comments: formatNumber(res.statistics.commentCount) || 0
                };
            } catch (error) {
                console.error('Error fetching video youtube info:', error.message);
                return null;
            }
        }
        function getRandomUserAgent() {
            const browsers = ["Chrome", "Firefox", "Safari", "Edge", "Opera"];
            const osList = [
                "Windows NT 10.0; Win64; x64",
                "Macintosh; Intel Mac OS X 10_15_7",
                "X11; Linux x86_64",
            ];
            const webKitVersion = `537.${Math.floor(Math.random() * 100)}`;
            const browserVersion = `${Math.floor(Math.random() * 100)}.0.${Math.floor(Math.random() * 10000)}.${Math.floor(Math.random() * 100)}`;
            const browser = browsers[Math.floor(Math.random() * browsers.length)];
            const os = osList[Math.floor(Math.random() * osList.length)];
            return `Mozilla/5.0 (${os}) AppleWebKit/${webKitVersion} (KHTML, like Gecko) ${browser}/${browserVersion} Safari/${webKitVersion}`;
        }
        const userAgent = getRandomUserAgent();
        let { author, likes, comments, views, favorites } = await getInfo(id);
        const { data } = await axios.request({
            method: 'GET',
            url: 'https://youtube-mp36.p.rapidapi.com/dl',
            params: {
                id,
                _: (Date.now() / 1000).toFixed(8),
            },
            headers: {
                'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com',
                'x-rapidapi-key': '3fb448bb80mshb8219b06208d8c8p179be5jsndaed67c1144f',
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'vi,en-US;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6',
                origin: 'https://ytmp3.cc',
                referer: 'https://ytmp3.cc/',
                'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': userAgent
            },
        });
        return {
            title: data.title,
            author,
            views,
            likes,
            comments,
            favorites,
            duration: data.duration,
            url: data.link
        }
    } catch (e) {
        console.log(e);
    }
}
async function getStreamAndSize(url, path = "") {
    const response = await axios({
        method: "GET",
        url,
        responseType: "stream",
        headers: {
            'Range': 'bytes=0-'
        }
    });
    if (path)
        response.data.path = path;
    const totalLength = response.headers["content-length"];
    return {
        stream: response.data,
        size: totalLength
    };
}
const MAX_SIZE = 27262976;
module.exports.config = {
    name: "sing2",
    version: "1.2.9",
    hasPermssion: 0,
    credits: "DongDev",
    usages: "Nghe nhạc từ nền tảng YouTube",
    commandCategory: "Tiện ích",
    cooldowns: 5,
    usePrefix: false,
    images: [],
    dependencies: {
        "fs-extra": ""
    }
};
     
module.exports.run = async function ({ args, event, api }) {
    const send = (msg, callback) => api.sendMessage(msg, event.threadID, callback, event.messageID);
    if (args.length === 0 || !args) {
        return send("❎ Phần tìm kiếm không được để trống!");
    }
    const keywordSearch = args.join(" ");
    const path = `${__dirname}/cache/${event.senderID}.mp3`;
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
    try {
        let keyWord = keywordSearch.includes("?feature=share") ? keywordSearch.replace("?feature=share", "") : keywordSearch;
        const maxResults = 2;
        let result = await search(keyWord);
        result = result.slice(0, maxResults);
        if (result.length === 0) {
            return send(`❎ Không có kết quả tìm kiếm nào phù hợp với từ khóa ${keyWord}`);
        }
        let msgg = "";
        let i = 1;
        const arrayID = [];
        for (const info of result) {
            arrayID.push(info.id);
            msgg += `${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name}\n\n`;
        }
        send(`${msgg}⩺ Reply tin nhắn với số để chọn`, (err, info) => {
            if (err) {
                return send(`❎ Đã xảy ra lỗi: ${err.message}`);
            }
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                arrayID,
                result,
                path
            });
        });
    } catch (err) {
        send(`❎ Đã xảy ra lỗi: ${err.message}`);
    }
};

module.exports.handleReply = async function ({ api, event }) {
    const send = (msg, callback) => api.sendMessage(msg, event.threadID, callback, event.messageID);
    try {
        const Reply = global.client.handleReply.find(item => item.messageID === event.messageReply.messageID);
        if (!Reply || Reply.author !== event.senderID) return;
        const startTime = Date.now();
        const data = Reply.result[event.body - 1];
        send(`⬇️ Đang tải xuống âm thanh \"${data.title}\"`, async (error, info) => {
            if (error) return send(`❎ Đã xảy ra lỗi: ${error.message}`);
            const { title, id, url, author, likes, views, comments, duration } = await getData(data.id);
            const savePath = Reply.path;
            const getStream = await getStreamAndSize(url, `${id}.mp3`);
            if (getStream.size > MAX_SIZE) {
                api.unsendMessage(info.messageID);
                return send(`❎ Không tìm thấy audio nào có dung lượng nhỏ hơn 26MB`);
            }
            const writeStream = fs.createWriteStream(savePath);
            getStream.stream.pipe(writeStream);
            const contentLength = getStream.size;
            let downloaded = 0;
            getStream.stream.on("data", chunk => {
                downloaded += chunk.length;
            });
            writeStream.on("finish", () => {
                send({
                    body: `🎬 Tiêu đề: ${title}\n👤 Tên kênh: ${author}\n👀 Lượt nghe: ${views}\n👍 Lượt thích: ${likes}\n💬 Bình luận: ${comments}\n⏱️ Thời lượng: ${data.time}\n⏳ Tốc độ xử lý: ${Math.floor((Date.now() - startTime) / 1000)} giây`,
                    attachment: fs.createReadStream(savePath)
                }, err => {
                    if (err) return send(`❎ Đã xảy ra lỗi: ${err.message}`);
                    fs.unlinkSync(savePath);
                });
            });
        });
    } catch (error) {
        console.log(error);
        send(`❎ Đã xảy ra lỗi: ${error.message}`);
    }
};