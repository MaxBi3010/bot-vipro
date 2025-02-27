module.exports.config = {
  "name": "qtv",
  "version": "1.0.0",
  "hasPermssion": 1,
  "credits": "Niiozic",
  "description": "Thêm hoặc xoá qtv",
  "commandCategory": "Quản trị viên",
  "usages": "",
  "cooldowns": 5
};
module.exports.run = async function ({ event, api, Currencies, args ,Users, Threads }) {
if(!args[0]) return api.sendMessage('⚠️ Lựa chọn qtv add [tag/reply]', event.threadID)
let dataThread = (await Threads.getData(event.threadID)).threadInfo;
if (!dataThread.adminIDs.some(item => item.id == api.getCurrentUserID()) && !dataThread.adminIDs.some(item => item.id == event.senderID)) return api.sendMessage('❎ Bạn không đủ quyền hạn dùng lệnh này', event.threadID, event.messageID);
if (args[0] == 'add') {
  if (event.type == "message_reply") {
    var uid1 = event.senderID
    var uid = event.messageReply.senderID
    let ten = global.data.userName.get(uid)
    api.sendMessage(`📌 Thả cảm xúc tin nhắn này để xác nhận ${ten} làm quản trị viên`,  event.threadID, (error, info) => {
global.client.handleReaction.push({
    name: this.config.name, 
    type: 'add' ,
    messageID: info.messageID,
    author: uid1,
    userID: uid
  })
      event.messageID
})
  } else if(args.join().indexOf('@') !== -1){
    var uid = Object.keys(event.mentions)[0]
    var uid1 = event.senderID
    let ten = global.data.userName.get(uid)
    api.sendMessage(`📌 Thả cảm xúc tin nhắn này để xác nhận ${ten} làm quản trị viên`,  event.threadID, (error, info) => {
global.client.handleReaction.push({
    name: this.config.name,
    type: 'add' ,
    messageID: info.messageID,
    author: uid1,
    userID: uid
  })
      event.messageID
})
  } else {
    var uid1 = event.senderID
    let ten = global.data.userName.get(uid)
    api.sendMessage(`📌 Thả cảm xúc tin nhắn này để xác nhận ${ten} làm quản trị viên`,  event.threadID, (error, info) => {
global.client.handleReaction.push({
    name: this.config.name,
    type: 'add' ,
    messageID: info.messageID,
    author: uid1,
    userID: uid1
  })
      event.messageID
})
  }
}
  if (args[0] == 'remove') {
  if (event.type == "message_reply") {
    var uid1 = event.senderID
    var uid = event.messageReply.senderID
    let ten = global.data.userName.get(uid)
    api.sendMessage(`📌 Thả cảm xúc tin nhắn này để xác nhận gỡ quản trị viên của ${ten} `,  event.threadID, (error, info) => {
global.client.handleReaction.push({
    name: this.config.name, 
    type: 'remove' ,
    messageID: info.messageID,
    author: uid1,
    userID: uid
  })
      event.messageID
})
  } else if(args.join().indexOf('@') !== -1){
    var uid = Object.keys(event.mentions)[0]
    var uid1 = event.senderID
    let ten = global.data.userName.get(uid)
    api.sendMessage(`📌 Thả cảm xúc tin nhắn này để xác nhận gỡ quản trị viên của ${ten} `,  event.threadID, (error, info) => {
global.client.handleReaction.push({
    name: this.config.name,
    type: 'remove' ,
    messageID: info.messageID,
    author: uid1,
    userID: uid
  })
      event.messageID
})
  }
}
}
module.exports.handleReaction = async function({ event, api, handleReaction, Currencies,Users}){
console.log(handleReaction)
if (event.userID != handleReaction.author) return;
if(handleReaction.type == 'add'){
  var name =  (await Users.getData(handleReaction.userID)).name
        api.changeAdminStatus(event.threadID, handleReaction.userID, true, editAdminsCallback)
        function editAdminsCallback(err) {
          if (err) return api.sendMessage("❎ Bot không đủ quyền hạn để thêm quản trị viên", event.threadID, event.messageID);
          return api.sendMessage(`✅ Đã thêm ${name} làm quản trị viên nhóm`, event.threadID, event.messageID);
        }
}
if(handleReaction.type == 'remove'){
      var name =  (await Users.getData(handleReaction.userID)).name
        api.changeAdminStatus(event.threadID, handleReaction.userID, false, editAdminsCallback)
        function editAdminsCallback(err) {
          if (err) return api.sendMessage("❎ Bot không đủ quyền hạn để thêm quản trị viên", event.threadID, event.messageID);
          return api.sendMessage(`✅ Đã gỡ quản trị viên của ${name}`, event.threadID, event.messageID);
        }
}
  }