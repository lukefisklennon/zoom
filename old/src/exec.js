var spawn = require("child_process").spawn;

module.exports = function(command, callback) {
	var parts = command.split(" ");
	var name = parts[0];
	parts.shift();
    var child = spawn('sh', ['-c', command], { stdio: 'inherit' });
    // child.stdout.on("data", function(data) {
    //     var string = data.toString();
    //     if (string.length > 0) {
    //         process.stdout.write(string);
    //     }
    // });
    // child.stderr.on("data", function(data) {
    //     var string = data.toString();
    //     if (string.length > 0) {
    //         process.stdout.write(string);
    //     }
    // });
	// child.on("exit", function(code) {
    //     if (callback) callback();
    // });
	// child.stdout.pipe(process.stdout);
	// child.stdin.setEncoding("utf-8");
	// process.openStdin().addListener("data", function(data) {
	// 	console.log(data.toString());
	// 	child.stdin.write(data.toString());
	// });
	// setTimeout(function() {
	// 	child.stdin.write("Luke");
	// }, 1000);
}
