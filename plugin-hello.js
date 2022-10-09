"use strict"
const { segment } = require("oicq")
const { bot } = require("./index")
const http = require('http');

const sd = require('silly-datetime');

let qihao = null;
let map = [];

// 撤回和发送群消息
bot.on("message.group", function (msg) {
	const groupName = msg.group_name;

	// 匹配上的不能进行下去，多个用或||
	// if(groupName.indexOf("SMT") != -1){
	// 	return
	// }

	// 匹配上的进行下去，多个用或&&
	// if(groupName.indexOf("派拉蒙") == -1){
	// 	return;
	// }

	const m = msg.raw_message.replace(/\s/g, "")
	if(null != qihao && m.indexOf(qihao) != -1 && m.indexOf("总分") != -1 && m.indexOf("人") != -1){
		if(m.indexOf("汤姆") != -1){
			setTimeout(function() {
				let b = m.substring(m.lastIndexOf("汤姆"), m.lastIndexOf("汤姆")+7);
				http.get("http://121.4.87.215:8582/digital/digitalAnalyseJnd/saveBet?recordNumber="+qihao+"&bet="+b,(res)=>{
				}).on("error",(e)=>{
					console.log(`获取数据失败: ${e.message}`)
					return;
				})
			}, 1000*20);
		} else if(m.indexOf("金蟾") != -1){
			setTimeout(function() {
				let b = m.substring(m.lastIndexOf("金蟾"), m.lastIndexOf("金蟾")+7);
				http.get("http://121.4.87.215:8582/digital/digitalAnalyseJnd/saveBet?recordNumber="+qihao+"&bet="+b,(res)=>{
				}).on("error",(e)=>{
					console.log(`获取数据失败: ${e.message}`)
					return;
				})
			}, 1000*20);
		} else if(m.indexOf("杰瑞") != -1){
			setTimeout(function() {
				let b = m.substring(m.lastIndexOf("杰瑞"), m.lastIndexOf("杰瑞")+7);
				http.get("http://121.4.87.215:8582/digital/digitalAnalyseJnd/saveBet?recordNumber="+qihao+"&bet="+b,(res)=>{
				}).on("error",(e)=>{
					console.log(`获取数据失败: ${e.message}`)
					return;
				})
			}, 1000*20);
		} else if(m.indexOf("菩提") != -1){
			setTimeout(function() {
				let b = m.substring(m.lastIndexOf("菩提"), m.lastIndexOf("菩提")+7);
				http.get("http://121.4.87.215:8582/digital/digitalAnalyseJnd/saveBet?recordNumber="+qihao+"&bet="+b,(res)=>{
				}).on("error",(e)=>{
					console.log(`获取数据失败: ${e.message}`)
					return;
				})
			}, 1000*20);
		}

	}

	if((m.indexOf("近20期") != -1 || m.indexOf("近 20 期") != -1) && (m.indexOf("291") != -1 || m.indexOf("292") != -1)){
		qihao = null;
		if(m.indexOf("291") != -1){
			qihao = m.substring(m.lastIndexOf("291"), m.lastIndexOf("291")+7);
		}
		if(m.indexOf("292") != -1){
			qihao = m.substring(m.lastIndexOf("292"), m.lastIndexOf("292")+7);
		}
		if(null != qihao){
			console.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm')+"  "+groupName+":"+qihao);

			if(map.indexOf(groupName) != -1){
				return;
			}

			let r = Math.random() * 10;
			let times = 30;
			if(Math.floor(r)%2==0){
				times = 35;
			}

			getServerInfo("http://121.4.87.215:8582/digital/digitalAnalyseJnd/queryByRecordNumber?recordNumber="+qihao, 1, times, msg, groupName);
		}
	}

	if(m.indexOf("金蟾") != -1 && m.indexOf("积分不足") != -1){
		// bot.logout(false);
		map.push(groupName);
	}

	if(m.indexOf("贪婪") != -1 && m.indexOf("积分不足") != -1){
		// bot.logout(false);
		map.push(groupName);
	}

	if(m.indexOf("杰瑞") != -1 && m.indexOf("积分不足") != -1){
		// bot.logout(false);
		map.push(groupName);
	}

	if(m.indexOf("菩提") != -1 && m.indexOf("积分不足") != -1){
		// bot.logout(false);
		map.push(groupName);
	}

	if(m.indexOf("汤姆") != -1 && m.indexOf("积分不足") != -1){
		// bot.logout(false);
		map.push(groupName);
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
			if(body.indexOf("未找到对应数据") != -1){
				// console.log(groupName+"："+body);
				if(temp > times){
					return;
				} else if(temp == times){
					temp++;
					setTimeout(function() {
						return getServerInfo("http://121.4.87.215:8582/digital/digitalAnalyseJnd/queryByRecordNumber?recordNumber="+qihao+"&type=end", temp, times, msg, groupName);
					}, 5000);
				} else {
					temp++;
					setTimeout(function() {
						return getServerInfo(url, temp, times, msg, groupName);
					}, 5000);
				}
			} else if(body.indexOf("无需提交") != -1){
				console.log(groupName+"："+body);
				return;
			} else if(body.indexOf("操作成功") != -1){
				console.log(groupName+"："+body);
				let jsonObject = JSON.parse(body);
				let result = jsonObject.result;

				let obj01 = result.analyse01;
				let obj02 = result.analyse02;
				let score = result.score;
				let digital = result.digital;

				let b = null;
				if(score/5 >= 50){
					b = score/5;
				} else if(score >= 100){
					b = 50;
				}

				if((null == obj01 && null == obj02)){
					return;
				} else if(null != obj01 && null == obj02){
					cl(obj01, score, digital, msg, groupName, b);
				} else if(null != obj02 && null == obj01){
					cl(obj02, score, digital, msg, groupName, b);
				} else {
					if(obj01 === obj02){
						cl(obj01, score, digital, msg, groupName, b);
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
								cl("大"+getLetter(digital).charAt(1), score, digital, msg, groupName, b);
							} else if("小" === s){
								cl("小"+getLetter(digital).charAt(1), score, digital, msg, groupName, b);
							}  else if("单" === s){
								cl(getLetter(digital).charAt(0)+"单", score, digital, msg, groupName, b);
							}  else if("双" === s){
								cl(getLetter(digital).charAt(0)+"双", score, digital, msg, groupName, b);
							} else {
								return;
							}
						} else {
							return;
						}
					}
				}
			} else {
				console.log(url);
				console.log(body);
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

function cl(obj, score, digital, msg, groupName, b){
	let send = null;
	if ("大双" === obj) {
		if(null == b){
			send = "大"+(score*2)+"小双"+score;
		} else {
			let r = Math.random() * 10;
			if(Math.floor(r)%2==0){
				send = "大双"+score+" 14."+b+" 小双"+score+" 大单"+score;
			} else {
				send = "大单"+score+" 大双"+score+" 小双"+score+" 14."+b;
			}
		}
	} else if ("大单" === obj) {
		if(null == b){
			if(digital>13){
				send = "大"+(score*2)+" 小单"+score;
			} else if (digital%2!=0) {
				send = "大双"+score+"单"+(score*2);
			} else {
				send = "大"+(score*2)+" 小单"+score;
			}
		} else {
			let r = Math.random() * 10;
			if(Math.floor(r)%2==0){
				send = "13."+b+" 大单"+score+" 14."+b+" 小单"+score+"大双"+score;
			} else {
				send = "大双"+score+" 14."+b+" 大单"+score+" 13."+b+" 小单"+score;
			}
		}
	} else if ("小单" === obj) {
		if(null == b){
			send = "大单"+score+" 小"+(score*2);
		} else {
			let r = Math.random() * 10;
			if(Math.floor(r)%2==0){
				send = "小单"+score+" 13."+b+" 小双"+score+" 大单"+score;
			} else {
				send = "大单"+score+"小单"+score+" 小双"+score+" 13."+b;
			}
		}
	} else if ("小双" === obj) {
		if(null == b){
			if(digital<14){
				send = "小"+(score*2)+" 大双"+score;
			} else if (digital%2==0) {
				send = " 小单"+score+"双"+(score*2);
			} else {
				send = "小"+(score*2)+" 大双"+score;
			}
		} else {
			let r = Math.random() * 10;
			if(Math.floor(r)%2==0){
				send = "小双"+score+" 14."+b+" 大双"+score+"小单"+score+" 13."+b;
			} else {
				send = "小单"+score+"大双"+score+" 13."+b+" 14."+b+" 小双"+score;
			}
		}
	}
	if(null != send){
		setTimeout(function() {
			msg.group.sendMsg(send);
			console.log(groupName+":"+send);
			http.get("http://121.4.87.215:8582/digital/digitalAnalyseJnd/saveBet?recordNumber="+qihao+"&bet="+groupName+":"+send,(res)=>{
			}).on("error",(e)=>{
				console.log(`获取数据失败: ${e.message}`)
				return;
			})
		}, 1000*5);
	}
	return;
}

