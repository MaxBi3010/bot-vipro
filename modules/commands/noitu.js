exports.config = {
    name: 'noitu',
    version: '1.4.0',
    hasPermssion: 0,
    credits: 'DC-Nam',
    description: 'Game nối chữ, chơi với bot hoặc với người khác!',
    commandCategory: 'game',
    usages: 'noitu + [bot/người] + tiền > 10000 VNĐ',
    cooldowns: 3
};

const fs = require('fs');
const path = __dirname + '/cache/noitu.txt';
let data = [];

const word_valid = word => /^[a-zA-Zà-ỹÀ-Ỹ]+ [a-zA-Zà-ỹÀ-Ỹ]+$/.test(word);

const save = () => fs.writeFileSync(path, data.join(','), 'utf8');
const stream_url = async url => (await require('axios').get(url, { responseType: 'stream' })).data;

exports.onLoad = async () => {
    if (!fs.existsSync(path)) {
        data = (await require('axios').get('https://raw.githubusercontent.com/J-JRT/api2/mainV2/linkword.json')).data.split(',').filter(word_valid);
        fs.writeFileSync(path, data.join(','), 'utf8'); // Lưu dữ liệu mới vào cache/noitu.txt
    } else {
        data = fs.readFileSync(path, 'utf8').split(',').filter(word_valid);
    }
};

exports.handleReply = async ({ handleReply: session, event, api, Currencies }) => {
    const word = (event.body || '').split(' ');
    const send = msg => api.sendMessage(msg, event.threadID, event.messageID);

    if (![session.player1, session.player2].includes(event.senderID)) return;

    const currentPlayer = event.senderID === session.player1 ? session.player1 : session.player2;
    const nextPlayer = event.senderID === session.player1 ? session.player2 : session.player1;

    if (!word_valid(word.join(' '))) return send(`[⚠️] ➜ Từ không hợp lệ!`);
    if (word[0].toLowerCase() !== session.last_word.split(' ')[1].toLowerCase()) {
        send(`[❌] ➜ Người chơi ${currentPlayer} đã thua!`);
        session.winner = nextPlayer;
        session.loser = currentPlayer;
        return announceWinner(session, api, Currencies);
    }

    session.last_word = word.join(' ');

    send(`Người chơi ${nextPlayer}, đến lượt bạn nối từ tiếp!`, (err, res) => {
        res.type = 'reply';
        res.player1 = session.player1;
        res.player2 = session.player2;
        res.last_word = session.last_word;
        res.bet = session.bet;
        client.handleReply.push(res);
    });
};

const announceWinner = async (session, api, Currencies) => {
    if (!session.winner) return;

    const prize = session.bet * 2;
    await Currencies.increaseMoney(session.winner, prize);
    await Currencies.decreaseMoney(session.loser, session.bet);

    api.sendMessage(
        `🎉 Kết quả sau 10 phút:\n[🏆] ➜ Người thắng: ${session.winner}\n[❌] ➜ Người thua: ${session.loser}\n[💰] ➜ Số tiền thắng: ${prize} VNĐ`,
        session.threadID
    );

    delete gameSessions[session.threadID];
};

exports.run = async ({ event, api, args, Currencies }) => {
    const send = msg => api.sendMessage(msg, event.threadID, event.messageID);
    const bet = parseInt(args[1]) || 0;

    if (!['bot', 'người'].includes(args[0])) return send(`[⚠️] ➜ Chọn chế độ chơi: "bot" hoặc "người"!`);
    if (bet < 10000 || bet > (await Currencies.getData(event.senderID)).money) {
        return send(`[⚠️] ➜ Bạn phải cược ít nhất 10,000 VNĐ để chơi!`);
    }

    if (args[0] === 'người') {
        const mention = Object.keys(event.mentions)[0];
        if (!mention) return send(`[⚠️] ➜ Hãy tag người bạn muốn chơi cùng!`);
        if (mention === event.senderID) return send(`[⚠️] ➜ Không thể tự chơi với chính mình!`);

        const first_word = data[Math.floor(Math.random() * data.length)];
        gameSessions[event.threadID] = {
            player1: event.senderID,
            player2: mention,
            last_word: first_word,
            bet,
            winner: null,
            loser: null,
        };

        send({
            body: `=== 『 GAME NỐI TỪ 』 ===\n━━━━━━━━━━━━━━━━\n[💵] ➜ Số tiền cược: ${bet} VNĐ\n[👥] ➜ Người chơi 1: ${event.senderID}\n[👥] ➜ Người chơi 2: ${mention}\n[📝] ➜ Từ bắt đầu: ${first_word}\n[⏳] ➜ Game sẽ kết thúc sau 10 phút nếu không có ai thua trước.`,
        });

        setTimeout(() => {
            if (gameSessions[event.threadID]) {
                announceWinner(gameSessions[event.threadID], api, Currencies);
            }
        }, 10 * 60 * 1000); // 10 phút
    } else if (args[0] === 'bot') {
        const first_word = data[Math.floor(Math.random() * data.length)];
        gameSessions[event.threadID] = {
            player1: event.senderID,
            player2: 'bot',
            last_word: first_word,
            bet,
            winner: null,
            loser: null,
        };

        send({
            body: `=== 『 GAME NỐI TỪ 』 ===\n━━━━━━━━━━━━━━━━\n[💵] ➜ Số tiền cược: ${bet} VNĐ\n[👥] ➜ Người chơi 1: ${event.senderID}\n[👥] ➜ Người chơi 2: Bot\n[📝] ➜ Từ bắt đầu: ${first_word}\n[⏳] ➜ Game sẽ kết thúc sau 10 phút nếu không có ai thua trước.`,
        });

        setTimeout(() => {
            if (gameSessions[event.threadID]) {
                announceWinner(gameSessions[event.threadID], api, Currencies);
            }
        }, 10 * 60 * 1000); // 10 phút
    } else {
        send(`[❌] ➜ Hiện tại chỉ hỗ trợ chơi giữa người chơi và Bot.`);
    }
};