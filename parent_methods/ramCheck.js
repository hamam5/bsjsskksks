/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

/* Checks the current ram every hour.
 * It resets the all shards if we have less than 0.75GB of ram left
 */
const si = require('systeminformation');
var Manager;
/* Interval to check (0.5H) */
const interval = 3600000/2;
/* Minimum ram (1GB) */
const resetbyte = 1024*1024*1024;
/* Shard reset delay (15s) */
const resetDelay = 30000;

/* Initial constrution */
exports.check = async function(ShardingManager){
	Manager = ShardingManager;
	setInterval(ramCheck,interval);
}

/* Checks ram and initial resetShards() if not enough */
async function ramCheck(){
	let mem = await si.mem();
	let ram = mem.available - mem.swaptotal;
	console.log("CURRENT RAM: "+(ram/(1024*1024*1024))+"G");
	if(ram<=resetbyte){
		console.log("NOT ENOUGH RAM. RESETTING SHARDS");
		resetShards();
	}
}

/* Assigns delays to shard resets */
function resetShards(){
	for(var i=0;i<Manager.totalShards;i++){
		var func = resetShard(i);
		setTimeout(func,(i+1)*resetDelay);
	}
}

/* Resets a shard via broadcastEval */
function resetShard(id){
	var num = id;
	return function(){
		Manager.broadcastEval(`
			if(this.shard.ids[0]==${num}){
				console.log("["+this.shard.ids[0]+"] Shard is restarting!");
				process.exit(0);
			}
		`);
	}
}
