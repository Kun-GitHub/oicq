"use strict"
const { segment } = require("oicq")
const { bot } = require("./index")
const http = require('http');

let qihao = null;

// 撤回和发送群消息
bot.on("message.group", function (msg) {
	const groupName = msg.group_name;
	// if(groupName.indexOf("阿玛尼") != -1 || groupName.indexOf("YZM") != -1){
	//
	// } else {
	//     return
	// }

	const m = msg.raw_message.replace(/\s/g, "")

	if(m.indexOf("近20期") != -1 && m.indexOf("284") != -1){
		qihao = null;
		qihao = m.substring(m.lastIndexOf("284"), m.lastIndexOf("284")+7);
		if(null != qihao){
			getServerInfo("http://121.4.87.215:8582/digital/digitalAnalyseJnd/queryByRecordNumber?recordNumber="+qihao+"&filter=1314", 1, 35, msg, groupName);
		}
	}
})

function getServerInfo(url, temp, times, msg, groupName){
	http.get(url,(res)=>{
		let body = ""
		res.on("data",(data)=>{
			body+=data
		})
		res.on("end",()=>{
			if(null == body){
				return;
			}
			console.log(body);
			if(body.indexOf("未找到对应数据") != -1){
				if(temp > times){
					return;
				} else if(temp == times){
					temp++;
					setTimeout(function() {
						return getServerInfo("http://121.4.87.215:8582/digital/digitalAnalyseJnd/queryByRecordNumber?recordNumber="+qihao+"&filter=1314&type=end", temp, times, msg, groupName);
					}, 3000);
				} else {
					temp++;
					setTimeout(function() {
						return getServerInfo(url, temp, times, msg, groupName);
					}, 3000);
				}
			} else if(body.indexOf("无需提交") != -1){
				return;
			} else if(body.indexOf("操作成功") != -1){
				let jsonObject = JSON.parse(body);
				let result = jsonObject.result;

				let obj01 = result.analyse01;
				let obj02 = result.analyse02;
				let score = result.score;
				let digital = result.digital;

				if((null == obj01 && null == obj02)){
					return;
				} else if(null != obj01 && null == obj02){
					cl(obj01, score, digital, msg, groupName);
				} else if(null != obj02 && null == obj01){
					cl(obj02, score, digital, msg, groupName);
				} else {
					if(obj01 === obj02){
						cl(obj01, score, digital, msg, groupName);
					} else {
						let s = null;
						for (let i = 0; i < obj01.length; i++) {
							for (let j = 0; j < obj02.length; j++) {
								if((obj01.charAt(i)+"") === obj02.charAt(j)+""){
									s = obj01.charAt(i)+"";
								}
							}
						}
						if(null != s){
							if("大" === s){
								cl("大"+getLetter(digital).charAt(1), score, digital, msg, groupName);
							} else if("小" === s){
								cl("小"+getLetter(digital).charAt(1), score, digital, msg, groupName);
							}  else if("单" === s){
								cl(getLetter(digital).charAt(0)+"单", score, digital, msg, groupName);
							}  else if("双" === s){
								cl(getLetter(digital).charAt(0)+"双", score, digital, msg, groupName);
							} else {
								return;
							}
						} else {
							return;
						}
					}
				}
			} else {
				return;
			}
		})
	}).on("error",(e)=>{
		console.log(`获取数据失败: ${e.message}`)
		return;
	})
	return;
}

function getLetter(integer) {
	if (0 == integer % 2){
		if (integer >= 14){
			return "大双";
		} else if(integer <= 13){
			return "小双";
		}
	} else if(0 != integer % 2){
		if (integer >= 14){
			return "大单";
		} else if(integer <= 13){
			return "小单";
		}
	}
	return "  ";
}

function cl(obj, score, digital, msg, groupName){
	let send = null;
	if ("大双" === obj) {
		send = "大"+(score*2)+"小双"+score;
	} else if ("大单" === obj) {
		if(digital>13){
			send = "大"+(score*2)+"小单"+score;
		} else if (digital%2!=0) {
			send = "单"+(score*2)+"大双"+score;
		} else {
			send = "大"+(score*2)+"小单"+score;
		}
	} else if ("小单" === obj) {
		send = "小"+(score*2)+"大单"+score;
	} else if ("小双" === obj) {
		if(digital<14){
			send = "小"+(score*2)+"大双"+score;
		} else if (digital%2==0) {
			send = "双"+(score*2)+"小单"+score;
		} else {
			send = "小"+(score*2)+"大双"+score;
		}
	}
	if(null != send){
		setTimeout(function() {
			msg.group.sendMsg(send);
			http.get("http://121.4.87.215:8582/digital/digitalAnalyseJnd/saveBet?recordNumber="+qihao+"&bet="+groupName+":"+send,(res)=>{
			}).on("error",(e)=>{
				console.log(`获取数据失败: ${e.message}`)
				return;
			})
		}, 1000*15);
	}
	return;
}

