exports.config = {
	name: "phantich",
	version: "0.0.9",
	hasPermssion: 0,
	credits: "Hải harin",
	description: "Phân tích ảnh khi có ảnh gửi vào nhóm",
	commandCategory: "Tiện ích",
	usages: "Phân tích ảnh khi có ảnh gửi vào nhóm",
	cooldowns: 5,
};
exports.handleEvent = async function (o){
  const { threadID: t, messageID: m, attachments: a } = o.event
  const send = msg => o.api.sendMessage(msg, t, m)
  var msg = []
  let threadSetting = global.data.threadData.get(t) || {};
  if (typeof threadSetting["phantich"] == "undefined", threadSetting["phantich"] == false) return
  else {
  if(a?.['length'] != 0){
  if(a?.[0]?.['type'] != 'photo') return
  else {
  for(let { url: h } of a){
  try{
  msg.push(await global.phantich.api(await require("tinyurl").shorten(h), "phantich"))
  } catch (e){
  msg.push("Đã xảy ra lỗi")
  }
  }
  send(msg.map((s, i) => `[ ${i+1} ] => ${s}`).join("\n\n"))
  }}}}
exports.run = async (o) => {
  const { threadID: t, messageID: m } = o.event
  const send = msg => o.api.sendMessage(msg, t, m)
  let data = (await o.Threads.getData(t)).data;
  if (typeof data["phantich"] == "undefined" || data["phantich"] == true) data["phantich"] = false;
  else data["phantich"] = true;
  await o.Threads.setData(t, { data });
  global.data.threadData.set(t, data);
  return send(`Đã ${(data["phantich"] == false) ? 'tắt' : "bật"} thành công phân tích ảnh`);
}
