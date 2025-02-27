const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "emojigif",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Modified by dgk",
    description: "Convert an emoji to its corresponding animated GIF",
    commandCategory: "Người dùng",
    usages: "[emoji]",
    usePrefix: true,
    cooldowns: 4,
    dependencies: {}
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    
    if (args.length < 1) {
        return api.sendMessage("⚠️ Vui lòng nhập một emoji để chuyển thành GIF: [emoji]", threadID, messageID);
    }
    const emojiInput = args[0];

    
    const availableEmojis =
        "😀😃😄😁😆😅😂🤣😭😉😗😙😚😘🥰😍🤩🥳🙃🙂🥲🥹😊☺️😌😏🤤😋😛😝😜🤪🥴😔🥺😬😑😐😶🤐🤔🤫🫢🤭🥱🤗😱🤨🧐😒🙄😮‍💨😤😠😡🤬😞😓😟😥😢☹️🙁😰😨😧😦😮😯😲😳🤯😖😣😩😫😵🥶🥵🤢🤮😴😪🤧🤒🤕😷🤥😇🤠🤑🤓😎🥸🤡😈👿🚀🦖🐘🦅🐵🐒🦍🐶🐕🐩🐺🦊🦝🐱🐈🦁🐯🐅🐆🐴🐎🦄🦓🦌🐮🐂🐃🐄🐷🐖🐗🐽🐏🐑🐐🐪🐫🦙🦒🐘🐹🦏🐀🦛🐁🐭🐰🐇🐿️🦔🦇🐻🐨🐼🐓🦘🐔🦃🦡🐾🐣🦅🐤🕊️🐧🐥🐦🦆🦉🦢🦚🦜🐸🐊🐢🦎🐍🐲🐉🦕🦖🐳🐋🐬🐟🐠🐡🦈🐌🐙🦑🐚🦐🦀🦞🦋🐛🐜🐝🐞🦗🕷️💮🕸️🌸🦂💐🦠🦟🏵️🌷🌹🌼🌻🥀🌺🌱🌿🌲🌾🌵🌳🌴🍃🍁🍂🍀☘️📻🔇🔈🔉🔊📢📣📯🔔🔕🎼🎵🎶🎙️🎚️🎛️🎤🎧🎷🎸🎹🎺🎻🥁📱📲☎️📞📟🖨️📠🖥️💻🔋🔌🖱️🖲️⌨️💽💾💿📀🧮📷📺🎥🎬📽️🎞️🔍📸🔎📹🕯️💡🔦🏮📔📕📖📗📘📙📄📚📜📃📓📒💴📰💰🗞️🏷️📑🔖💸💶💵💷💳🧾💹💱📤💲📩📨✉️📧📦📫📥📪📬📭📮🖍️🗳️🖌️✏️🖊️✒️🖋️📝📆💼📅🗂️📁📂🗓️📇🗒️📈📉📊📋✂️📌📐📍📏📎🖇️🗑️🔒🗄️🔓🗃️🔏🔐🗡️🔑🛠️🗝️⚒️🔨⛏️🔫🏹⚔️🛡️🔧🔩⚙️⚗️🗜️🧲⚖️🧰🔗⛓️🧫🧬🧪🔬🔭📡💉🛁💊🚿🚪🚽🛋️🛏️🧺🧹🧻🧷🧴🧼🧽🏧🧯🗿🛒⚱️🚬⚰️🔞🚯📵🚭⛔🚳☢️🚫☣️🚯🚷🚱🚸🚾⚠️🛂🛅🛄🛃↘️➡️⬆️☢️↖️⤴️🛐⤵️🔛🛐☯️🔝🔜✝️🔯♉🕎♊🕎♋☪️✝️☮️🕉️⚛️♓⏩⛎▶️🔂🔁⏭️⏯️🔽🔼⏸️⏏️🎦⏬⏺️⏹️⏮️⏪♾️⚕️♂️📶🔱📶♂️📴☑️";

    if (!availableEmojis.includes(emojiInput)) {
        return api.sendMessage(`❌ Emoji "${emojiInput}" không được hỗ trợ hoặc không hợp lệ!`, threadID, messageID);
    }

    try {
        
        const emojiCode = emojiInput.codePointAt(0).toString(16).toLowerCase();

       
        const gifUrl = `https://fonts.gstatic.com/s/e/notoemoji/latest/${emojiCode}/512.gif`;

        
        const gifPath = path.join(__dirname, 'cache', 'emoji.gif');
        const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(gifPath, Buffer.from(response.data));

        
        return api.sendMessage({ body: "✨ Emoji GIF:", attachment: fs.createReadStream(gifPath) }, threadID, messageID);
    } catch (error) {
        console.error(error);
        return api.sendMessage("❌ Đã xảy ra lỗi trong quá trình chuyển đổi emoji thành GIF.", threadID, messageID);
    }
};
