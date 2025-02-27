class Command {
    constructor(config) {
        this.config = config;
    }

    async run(o) {
        let send = msg => new Promise(r => o.api.sendMessage(msg, o.event.threadID, (err, res) => r(res || err), o.event.messageID));
        send({
            attachment: global.vdanime.splice(0,1),
        });
    }
}

module.exports = new Command({
    name: 'vdanime',
    version: '0.0.1',
    hasPermssion: 0,
    credits: 'DC-Nam',
    description: 'Xem video ',
    commandCategory: 'video',
    usages: '[]',
    cooldowns: 0,
});
