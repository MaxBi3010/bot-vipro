module.exports.config = {
	name: "cccd",
	version: "1.1.2",
	hasPermssion: 0,
	credits: "DVB ",
	description: "Tạo CCCD Fake",
	commandCategory: "Người dùng",
	usages: "Tên|Ngày / Tháng / Năm Sinh|Giới Tính|Nơi thường trú",
	cooldowns: 5,
	dependencies: { tinyurl: "" }
};

const
	capi = "https://subhatde.id.vn/cccd?", // API mới
	pathsave = __dirname + `/cache/cccd.png`, // Đường dẫn lưu ảnh
	msg1 = "Bạn phải reply ảnh để lấy ảnh tạo CCCD!",
	msg2 = "Sai định dạng ảnh! Vui lòng thử lại.",
	msg3 = "Đang render ảnh! Vui lòng chờ giây lát...",
	msg4 = "CCCD đã được tạo thành công!";

module.exports.run = async function ({ api, event, args }) {
	const axios = require('axios');
	const fs = require("fs-extra");
	const qs = require("querystring");
	const { threadID, messageID } = event;

	// Kiểm tra xem có reply ảnh hay không
	if (event.type !== "message_reply") return api.sendMessage(msg1, threadID, messageID);
	if (!event.messageReply.attachments || event.messageReply.attachments.length === 0)
		return api.sendMessage(msg2, threadID, messageID);

	// Rút gọn URL ảnh
	const urlimg = await global.nodemodule.tinyurl.shorten(event.messageReply.attachments[0].url);

	// Phân tích thông tin từ args
	const content = args.join(" ").split("|").map(item => item.trim());
	const [text1, text2, text3, text4] = content;

	if (!text1 || !text2 || !text3 || !text4)
		return api.sendMessage("❌ Sai định dạng! Hãy nhập: Tên|Ngày / Tháng / Năm Sinh|Giới Tính|Nơi thường trú", threadID, messageID);

	// Tạo tham số cho API
	let params = { text1, text2, text3, text4, urlimg };
	params = qs.stringify(params);

	// Gửi thông báo đang render
	api.sendMessage(msg3, threadID, messageID);

	try {
		// Gọi API tạo CCCD
		const response = await axios.get(capi + params, { responseType: "stream" });

		// Lưu ảnh vào cache
		const writer = fs.createWriteStream(pathsave);
		response.data.pipe(writer);

		writer.on("finish", () => {
			// Gửi ảnh sau khi render xong
			api.sendMessage({
				body: msg4,
				attachment: fs.createReadStream(pathsave)
			}, threadID, () => fs.unlinkSync(pathsave), messageID);
		});

		writer.on("error", () => {
			api.sendMessage("⚠️ Đã xảy ra lỗi khi lưu ảnh!", threadID, messageID);
		});
	} catch (error) {
		// Thông báo lỗi nếu xảy ra
		api.sendMessage(`⚠️ Lỗi khi gọi API: ${error.message}`, threadID, messageID);
	}
};

module.exports.languages = { "vi": {} }; // Đảm bảo không lỗi languages