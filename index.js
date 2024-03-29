"use strict"
const { createClient } = require("oicq")

const account = 3598939674

const bot = createClient(account)

bot.on("system.login.qrcode", function (e) {
	this.logger.mark("扫码后按Enter完成登录")
	process.stdin.once("data", () => {
		this.login()
	})
}).login()

// //若弹出登录保护地址，去验证通过即可
// bot.login("1234554321")
bot.on("system.login.slider", ()=>{
	process.stdin.once("data", (input)=>{
		input = String(input).trim().replace("ticket:", "").trim().replace(/"/g, "");
		bot.sliderLogin(input);
	});
});

exports.bot = bot

// template plugins
// require("./plugin-sanmen") //三门
require("./plugin-shuashui") //刷水
require("./plugin-request") //加群和好友
require("./plugin-online") //监听上线事件

process.on("unhandledRejection", (reason, promise) => {
	console.log('Unhandled Rejection at:', promise, 'reason:', reason)
})
