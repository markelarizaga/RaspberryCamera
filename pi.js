var RaspiCam = require("raspicam");
var express = require('express');
var motionDetector = require("./MotionDetector");

var app = express();
var camera = new RaspiCam({
	mode: "photo",
	output: "/home/pi/RaspberryCamera/photos/picture.jpg"
});

var cameraOptions = {
	PHOTO: "photo",
	VIDEO: "video"
};
var PHOTO_FOLDER = "/home/pi/RaspberryCamera/photos/";
var VIDEO_FOLDER = "/home/pi/RaspberryCamera/videos/";
var server = {
	PORT : 3000
};
var RESTART_DELAY = 3000;

function delayedStart (delay) {
	console.log("STARTING WITH DELAY");
	setTimeout(function(){camera.start();}, delay);
}

camera.configureFor = function (option) {
	var changed = false;
	switch (option) {
		case cameraOptions.PHOTO:
			if(camera.get("mode") !== cameraOptions.PHOTO){
				camera.set("mode", "photo");
				changed = true;
			}
			camera.set("output", PHOTO_FOLDER + new Date().getTime() + ".jpg");
			break;
		case cameraOptions.VIDEO:
			if(camera.get("mode") !== cameraOptions.VIDEO){
				camera.set("mode", "video");
				changed = true;
			}
			if(camera.get("output") !== VIDEO_FOLDER + "video.h264") {
				camera.set("output", VIDEO_FOLDER + "video.h264");
				changed = true;
			}
			if(camera.get("timeout") !== 10000) {
				camera.set("timeout", 10000);
				changed = true;
			}
			break;
	}
	if(changed) {
		console.log("Changed camera configuration for " + option);
	}
}

app.get('/photo', function(req, res){
	camera.configureFor("photo");
	camera.once("read", function(err, date, filename){ 
		if (err) {
			throw err;
		}
		res.write("200");
		res.end();
	});
	if(motionDetector.isMonitoring()) {
		console.log("Stoping monitor");
		motionDetector.stop();
	}
	delayedStart(RESTART_DELAY);
});

app.get('/video', function(req, res){
	camera.configureFor("video");
	camera.once("exit", function(err, date, filename){ 
		if (err) {
			throw err;
		}
		res.write("200");
		res.end();
	});
	if(motionDetector.isMonitoring()) {
		motionDetector.stop();
	}
	delayedStart(RESTART_DELAY);
});

function monitorCallback(){
	console.log("Motion detected");
	camera.configureFor("photo");
	camera.start();
}

function setCameraCallbacks() {
	//listen for the "read" event triggered when each new photo is saved
	camera.on("read", function(err, date, filename){ 
		if (err) {
			throw err;
		}
		console.log("Stoping camera");
		camera.stop();
		setTimeout(startMonitoring, RESTART_DELAY);
	});
	//listen for the "exit" event triggered when each new video is saved
	camera.on("exit", function(err, date, filename){ 
		if (err) {
			throw err;
		}
		camera.stop();
		setTimeout(startMonitoring, RESTART_DELAY);
	});
}

function startMonitoring () {
	motionDetector.start(monitorCallback);
}

app.listen(server.PORT, function() {
	console.log('Listening on port ' + server.PORT);
	setCameraCallbacks();
	startMonitoring();
});