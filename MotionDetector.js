var childProcess = require('child_process').spawn;
var pythonProcess = null;
var IS_MONITORING = false;

exports.monitor = function(motionDetectedCallback) {
	console.log("Start monitoring");
	IS_MONITORING = true;
	pythonProcess = new childProcess(
		'python',
		// second argument is array of parameters, e.g.:
		["/home/pi/RaspberryCamera/app/scripts/picam.py"]
	);
	pythonProcess.stdout.on('data', function(data){
		IS_MONITORING = false;
		if(motionDetectedCallback) {
			motionDetectedCallback();
		}
	});
	pythonProcess.on('close', function (code) { 
	});
	pythonProcess.stderr.on('data', function (data) {
		IS_MONITORING = false;
	});
};

exports.stopMonitoring = function() {
	console.log("Stopping monitorization");
	pythonProcess.kill();
	IS_MONITORING = false;
};

exports.isMonitoring = function(){
	return IS_MONITORING;
};