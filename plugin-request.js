"use strict"
const { bot } = require("./index")

// 同意群邀请
bot.on("request.group.invite", e => e.approve())

