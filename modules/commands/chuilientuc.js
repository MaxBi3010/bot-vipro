module.exports.config = {
    name: "chuilientuc",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "...",
    description: "Tag liên tục người bạn tag\nDùng chuilientuc @mention để tag 1 người trong 5 lần hoặc chuilientuc chuidenchet @mention time để chửi đến khi hết thời gian",
    commandCategory: "Người dùng",
    usages: "chuilientuc @mention | chuilientuc @mention stop | chuilientuc chuidenchet @mention time",
    cooldowns: 1,
    dependencies: {
        "fs-extra": "",
        "axios": ""
    }
};

let isTagging = false;

module.exports.run = async function({ api, args, Users, event }) {
    var mention = Object.keys(event.mentions)[0];
    if (!mention) return api.sendMessage("Cần phải tag 1 người bạn muốn chửi", event.threadID);

    const stopCommand = args.includes("stop");
    if (stopCommand) {
        isTagging = false;
        return api.sendMessage("Đã dừng chửi liên tục.", event.threadID);
    }

    // Check if it's "chuildenchet" command
    const isEndlessTagging = args[0] === "chuildenchet";
    let timeLimit = null;
    if (isEndlessTagging) {
        timeLimit = parseInt(args[args.length - 1], 10) * 1000; // Convert seconds to milliseconds
        if (isNaN(timeLimit)) return api.sendMessage("Vui lòng nhập thời gian hợp lệ (tính bằng giây).", event.threadID);
    }

    if (isTagging) return api.sendMessage("Đang chửi liên tục rồi. Dùng lệnh 'chuilientuc + @ stop' để dừng.", event.threadID);
    isTagging = true;

    let name = event.mentions[mention];
    var arraytag = [{ id: mention, tag: name }];
    var a = function (a) { api.sendMessage(a, event.threadID); };

    const messages = [
        `Ngóng tai mà nghe bố mày chửi nè!`,
        `Đ!t con mẹ mày ${name}`, 
        `Địt cái lồn mẹ mày chết chưa hả thằng lồn ${name}`,
        `Bố mày địt mẹ mày luôn đấy con chó ${name}`,
        `Địt vô đầu gối, địt thối màn trinh ${name}`,
        `Địt bất thình lình ${name}`,
        `Địt kiểu âu tướng, địt hướng mặt trời ${name}`,
        `Địt chơi địt bời, địt ra kiểu mới ${name}`,
        `Địt tới địt lui, địt búi cả đầu ${name}`,
        `Địt đâu cũng chết, địt bết cả lồn ${name}`,
        `Địt kiểu ngang kiểu dọc, kiểu không cần khoa học ${name}`,
        `Cũng chọc thủng lồn cái con đĩ mẹ mày ${name}`,
        `Cái thằng đâm cha chém chú, bóp vú chị dâu ${name}`,
        `Cạo đầu em nhỏ bắn bỏ em trai, kì lồn em gái ${name}`,
        `Đái ỉa ra sông như công xỉa cánh ${name}`,
        `Như đánh chó hoang, đập đầu chó thiến ${name}`,
        `Bú lồn chim sẻ, bẽ lồn chim ri ${name}`,
        `Kì lồn chim cắt mà đút lồn vào chim trâu ${name}`,
        `Địt cái lồn mẹ mày thấy mày chết chưa hả con chó ăn cứt ${name}`,
        `Đi với phật thì mặc áo cà sa, đi với ma thì mặc áo giấy ${name}`,
        `Mà cái lồn con đĩ mẹ mày không đầy chấy thì cũng đầy ve ${name}`,
        `Mà giữa cái hột le lại đầy ghẻ mới đẻ ra thằng súc vật như mày`,
        `Tao mệt rồi không chửi nữa ${name}`,
        `Nào ông chủ update lyric thì chửi tiếp nha con súc vật ${name}`,
        `Xin chào và hẹn gặp lại thứ tinh trùng khuyết tật, thất bại của tạo hoá ${name}`,
        `Gút Bai 🥺`
    ];

    const startTime = Date.now();

    function tagLoop(i = 0) {
        if (!isTagging || (isEndlessTagging && Date.now() - startTime >= timeLimit)) {
            isTagging = false;
            return;
        }

        a({ body: messages[i % messages.length], mentions: arraytag });
        setTimeout(() => tagLoop(i + 1), 3000);
    }

    tagLoop();
};