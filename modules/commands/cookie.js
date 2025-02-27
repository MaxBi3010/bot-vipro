const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "cookie",
  version: "1.0.3",
  hasPermission: 3,
  credits: "DongDev",
  description: "Quản lý cookie: sao chép hoặc thay đổi cookie",
  commandCategory: "Admin",
  usages: "[-cookie change] hoặc [-cookie <nội_dung_cookie>]",
  cooldowns: 5,
  images: [],
};

module.exports.run = async ({ api: a, event: e, args: q }) => {
  const { threadID: tid, messageID: mid } = e;
  const cookieFilePath = path.join(__dirname, './../../cookie.txt');
  const jsonFilePath = path.join(__dirname, './../../modules/commands/cache/cookie.json');

  
  if (q[0] === "change") {
    try {
      // Kiểm tra sự tồn tại của file cookie.txt
      if (!fs.existsSync(cookieFilePath)) {
        a.sendMessage('⚠️ Không tìm thấy file cookie.txt', tid, mid);
        return;
      }

      
      const newCookie = fs.readFileSync(cookieFilePath, 'utf-8').trim();

      if (!newCookie) {
        a.sendMessage('⚠️ File cookie.txt trống, vui lòng kiểm tra lại.', tid, mid);
        return;
      }

      
      const jsonData = fs.existsSync(jsonFilePath)
        ? JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'))
        : {};

     
      jsonData.cookie = newCookie;


      fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');

      a.sendMessage('☑️ Cookie đã được sao chép từ cookie.txt sang cookie.json thành công!', tid, mid);
    } catch (error) {
      console.error('Error:', error);
      a.sendMessage('❎ Có lỗi xảy ra khi sao chép cookie', tid, mid);
    }
    return;
  }

  
  if (q.length === 0) {
    a.sendMessage('⚠️ Vui lòng nhập cookie để thay đổi vào file cookie.txt.', tid, mid);
    return;
  }

  
  try {
    const newCookie = q.join(" ");

    
    fs.writeFileSync(cookieFilePath, newCookie, 'utf-8');

    a.sendMessage('☑️ Cookie mới đã được ghi vào file cookie.txt thành công!', tid, mid);
  } catch (error) {
    console.error('Error:', error);
    a.sendMessage('❎ Có lỗi xảy ra khi ghi cookie vào file cookie.txt', tid, mid);
  }
};