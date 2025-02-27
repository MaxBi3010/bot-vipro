module.exports.config = {
    name: "1c",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Zn", // Fix By Zeon
    description: "Nhây 1 chữ + @",
    commandCategory: "War",
    usages: "",
    cooldowns: 1,
};

module.exports.run = async function ({ api, event, args }) {
    if (args[0] == "s") {
        api.sendMessage("Cayyyy", event.threadID, () => process.exit(1));
    } else {
        const timedelay = 10; // Thời gian gửi 1 tin nhắn
        const slsp = 400000000000000000000; // Số lần spam
        const xbach = [
            "Đồ con chó!",
            "Mày ngu như bò!",
            "Câm mồm lại hộ bố!",
            "Đần độn mà còn to mồm à?",
            "Ngu thì im đi đỡ ngứa mắt!",
            "Não như con ruồi mà thích gáy?",
            "Mày cay không con chó?",
            "Cái giống như mày chỉ làm trò hề!",
            "Thôi cút đi, đừng sủa nữa!",
            "Đồ súc sinh vô học!",
            "Đần độn thế mà cũng nói được!",
            "Mày nhây thì tao nhây luôn!",
            "Nhìn mày như con lợn ý!",
            "Ngu mà cứ nghĩ mình giỏi!",
            "Chết đi cho sạch đất, con ạ!",
            "Nghe mày gáy tao muốn đập vào mặt!",
            "Đồ con lợn béo!",
            "Thằng mất nết, cút!",
            "Mày đúng kiểu làm trò hề!",
            "Đồ óc bã đậu, không biết nhục à?",
            "Ngu như lợn mà cứ thích tỏ ra nguy hiểm!",
            "Mày khóc chưa con chó?",
            "Ngáo đá à, nói như khùng?",
            "Chắc não mày rỗng luôn rồi!",
            "Mày đúng là đồ vô học!",
            "Ngu như bò mà còn thích thể hiện!",
            "Tao sút vỡ mồm mày bây giờ!",
            "Cay không con chó?",
            "Nhìn mặt mày tao muốn tát cho tỉnh!",
            "Đồ óc lợn, nhục chưa?",
            "Lêu lêu ngu dốt!"
        ];

        // Kiểm tra có tag người nào không
        const mentions = Object.keys(event.mentions);
        if (mentions.length === 0) {
            return api.sendMessage("Vui lòng tag người cần chửi!", event.threadID);
        }
        const mentionID = mentions[0]; // Lấy ID người được tag đầu tiên
        const mentionName = event.mentions[mentionID]; // Tên người được tag

        for (let i = 1; i < slsp; i++) {
            for (let j = 0; j < xbach.length; j++) {
                const xbachMessage = xbach[j];
                api.sendMessage({
                    body: `${xbachMessage} ${mentionName}`,
                    mentions: [
                        {
                            tag: `${mentionName}`,
                            id: mentionID
                        }
                    ]
                }, event.threadID);
                await new Promise(resolve => setTimeout(resolve, timedelay * 500));
            }
        }
    }
};