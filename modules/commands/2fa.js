let { quất_đẹp_trai } = require(`${__dirname}/admin.js`)
if (quất_đẹp_trai) {
	const { execSync } = require('child_process')
	let exec = () => execSync('unused-deps').toString().split('\n').filter(a => a != "")
	if (exec().length > 0) exec().map(
		a => execSync(a.replace('--save     ', ''),
			console.log(`Đã gỡ cài đặt package ${a.replace('npm uninstall --save     ', '')} khi không dùng đến`)
		)
	)
	else console.log('Không có packge nào dư thừa')
}
module.exports.config = {
		name: "2fa",
		version: "1.0.0",
		hasPermission: 0,
		credits: "Thjhn",
		description: "lấy 2fa",
		commandCategory: "Admin",
		usages: "/2fa (code_2fa)",
		cooldowns: 5,
	  usePrefix: true,
};

const axios = require('axios');

module.exports.run = async ({ api, event, args }) => {
		const ok = args.join(' ');
		if (!ok) {
			return api.sendMessage("Vui lòng nhập mã 2fa !", event.threadID);
		}
		const response = await axios.get(`https://api.code.pro.vn/2fa/v1/get-code?secretKey=${ok}`);
		const cc = response.data.code;

	api.sendMessage(`${cc}`, event.threadID);
};
