module.exports.config = {
    name: "tx",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Satoru",
    description: "Game tài xỉu",
    commandCategory: "Cờ Bạc",
    usages: "tx [on/off] hoặc chat tài/xỉu [số tiền]",
    cooldowns: 0
};

module.exports.run = async function({ api, event, Threads, Users, Currencies, args }) {
    const fs = require("fs-extra");
    const path = require("path");
    const { threadID, senderID } = event;

    const basePath = path.resolve(__dirname, 'game/taixiu/');
    const fileCheck = path.join(basePath, 'file_check.json');
    fs.ensureDirSync(basePath);

    if (!fs.existsSync(fileCheck)) fs.writeFileSync(fileCheck, "[]", "utf-8");
    const checkData = JSON.parse(fs.readFileSync(fileCheck, "utf-8"));

    const threadAdmins = (await api.getThreadInfo(threadID)).adminIDs.map(admin => admin.id);
    const isBotAdmin = global.config.ADMINBOT.includes(senderID);
    if (!["on", "off"].includes(args[0])) {
        return api.sendMessage("❌ Vui lòng dùng: tx on/off để bật/tắt game.", threadID);
    }

    if (!threadAdmins.includes(senderID) & !isBotAdmin) {
        return api.sendMessage("❌ Chỉ quản trị viên nhóm mới có quyền bật/tắt game!", threadID);
    }

    if (args[0] === "on") {
        if (!checkData.includes(threadID)) {
            checkData.push(threadID);
            fs.writeFileSync(fileCheck, JSON.stringify(checkData));
            api.sendMessage("✅ Đã bật game tài xỉu!", threadID);

            if (checkData.length === 1) {
                const handleTaixiu = require("./../../gojo/handle/handleTaixiu");
                handleTaixiu({ api, event, Users, Threads, Currencies });
            }
        } else {
            api.sendMessage("❌ Game tài xỉu đã được bật từ trước!", threadID);
        }
    } else if (args[0] === "off") {
        const index = checkData.indexOf(threadID);
        if (index !== -1) {
            checkData.splice(index, 1);
            fs.writeFileSync(fileCheck, JSON.stringify(checkData));
            api.sendMessage("✅ Đã tắt game tài xỉu!", threadID);
        } else {
            api.sendMessage("❌ Game tài xỉu chưa được bật!", threadID);
        }
    }
};

module.exports.handleEvent = async function({ api, event, Currencies, Users }) {
    const fs = require("fs-extra");
    const path = require("path");
    const { body, threadID, senderID } = event;

    if (!body) return;

    const basePath = path.resolve(__dirname, './game/taixiu/');
    const betHistoryPath = path.join(basePath, 'data/betHistory/');
    const fileCheck = path.join(basePath, 'file_check.json');
    const phiênFile = path.join(basePath, 'phiên.json');

    if (!fs.existsSync(fileCheck)) return;
    if (!fs.existsSync(phiênFile)) fs.writeFileSync(phiênFile, "[]", "utf-8");

    const checkData = JSON.parse(fs.readFileSync(fileCheck, "utf-8"));
    if (!checkData.includes(threadID)) return;

    if (!global.tx || global.tx.i >= 55 || global.tx.i === 0) {
      api.sendMessage("❌ Hết thời gian đặt cược.", event.threadID, event.messageID);
        return;
    }

    const args = body.toLowerCase().split(' ');
    if (args.length !== 2) return;

    const choice = args[0];
    let betAmount;
    
    if (args[1] === 'all') {
        const userBalance = await Currencies.getData(senderID);
        betAmount = userBalance.money;
    } else {
        betAmount = convertBetString(args[1]);
    }

    if (betAmount <= 0) {
      return;
    }
    
    if (!['tài', 'xỉu'].includes(choice)) return;

    try {
        const userBalance = await Currencies.getData(senderID);
        if (userBalance.money < betAmount) {
            return api.sendMessage("❌ Số dư không đủ để đặt cược!", threadID);
        }

        await Currencies.decreaseMoney(senderID, betAmount);
        const phiênData = JSON.parse(fs.readFileSync(phiênFile, "utf-8"));
        const currentPhiên = phiênData.length ? phiênData[phiênData.length - 1].phien : 1;

        const betFile = path.join(betHistoryPath, `${senderID}.json`);
        let userBets = [];
        if (fs.existsSync(betFile)) {
            userBets = JSON.parse(fs.readFileSync(betFile));
        }

        userBets.push({
            senderID,
            threadID,
            betAmount,
            choice,
            phien: currentPhiên,
            time: new Date().toISOString()
        });

        fs.writeFileSync(betFile, JSON.stringify(userBets, null, 4));
        const userInfo = await Users.getData(senderID);
        const userName = userInfo.name || senderID.toString();
        const remainingTime = 60 - global.tx.i;

        return api.sendMessage(
            `✅  Thành công !\n\n👤 Người chơi: ${userName} \n🎲 Cược: ${choice.toUpperCase()}.\n💵 Số tiền: ${betAmount.toLocaleString()} VND\n⏳ Thời gian còn lại: ${remainingTime} giây.`,
            threadID
        );
    } catch (error) {
        console.error('[TAIXIU] Error handling bet:', error);
        api.sendMessage("❌ Có lỗi xảy ra khi đặt cược!", threadID);
    }
};

function convertBetString(betString) {
    const multiplier = {
        "k": 1000,
        "m": 1000000,
        "b": 1000000000
    };
    const unit = betString.slice(-1);
    const value = parseFloat(betString.slice(0, -1));

    if (!isNaN(betString)) {
        return parseInt(betString);
    }

    if (isNaN(value) || !multiplier[unit]) {
        return -1;
    }
    return value * multiplier[unit];
}