var childProcess = require('child_process').spawn;
var pythonProcess = null;
var IS_MONITORING = false;

exports.start = function(motionDetectedCallback) {
	console.log("Start monitoring");
	IS_MONITORING = true;
	pythonProcess = new childProcess(
		'python',
		// second argument is array of parameters, e.g.:
		["/home/pi/RaspberryCamera/app/scripts/picam.py"]
	);
	pythonProcess.stdout.on('data', function(data){
		console.log("Standard data received");
		IS_MONITORING = false;
		if(motionDetectedCallback) {
			motionDetectedCallback();
		}
	});
	pythonProcess.on('close', function (code) { 
		console.log("Process closed");
	});
	pythonProcess.stderr.on('data', function (data) {
		console.log("Error data received");
		IS_MONITORING = false;
	});
};

exports.stop = function() {
	console.log("Stopping monitoring");
	pythonProcess.kill();
	IS_MONITORING = false;
};

exports.isMonitoring = function(){
	return IS_MONITORING;
};