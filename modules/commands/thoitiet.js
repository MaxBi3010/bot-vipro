const axios = require('axios');

module.exports.config = {
    name: "ttt",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "88",
    description: "Xem thời tiết cho địa điểm cụ thể",
    commandCategory: "Người dùng",
    usages: "[địa điểm]",
    cooldowns: 5,
    dependencies: {
        "axios": ""
    }
};

async function sendWeather(api, threadID, location = "Hanoi") {
    try {
        // Gọi API lấy thông tin thời tiết
        const response = await axios.get(`https://api.popcat.xyz/weather?q=${encodeURIComponent(location)}`);
        const weatherData = response.data[0];

        if (!weatherData || !weatherData.location || !weatherData.current) {
            return api.sendMessage(`Không thể tìm thấy thông tin thời tiết cho địa điểm: ${location}. Vui lòng thử lại.`, threadID);
        }

        const { location: loc, current, forecast } = weatherData;

        // Chuẩn bị nội dung tin nhắn thời tiết
        let message = `
🌤️ Thời tiết tại ${loc.name} (${loc.lat}, ${loc.long}):
- Nhiệt độ hiện tại: ${current.temperature}°${loc.degreetype} (Cảm giác: ${current.feelslike}°)
- Tình trạng: ${current.skytext}
- Độ ẩm: ${current.humidity}%
- Tốc độ gió: ${current.winddisplay}
- Thời gian quan sát: ${current.observationtime}

🌥️ Dự báo thời tiết:
        `;

        forecast.slice(0, 3).forEach(day => {
            message += `
- ${day.day} (${day.date}): ${day.skytextday}, Nhiệt độ: ${day.low}° - ${day.high}°${loc.degreetype}, Mưa: ${day.precip}%`;
        });

        // Gửi tin nhắn thời tiết
        api.sendMessage(message, threadID);
    } catch (error) {
        console.error("Lỗi khi lấy thông tin thời tiết:", error.message);
        api.sendMessage("Lỗi khi lấy thông tin thời tiết. Vui lòng thử lại sau.", threadID);
    }
}

module.exports.run = async function ({ api, event, args }) {
    const location = args.join(" ") || "Hanoi";
    await sendWeather(api, event.threadID, location);
};
