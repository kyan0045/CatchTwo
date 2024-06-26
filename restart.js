// Importing the 'spawn' function from the 'child_process' module to create child processes
const { spawn } = require("child_process");

// Spawning a new child process to execute the 'node' command with the current directory as an argument
// This effectively restarts the application by running it again in the same process
const child = spawn("node", ["."], {
  stdio: "inherit", // Configuring the child process to use the parent's stdio streams
});

// Listening for the 'close' event, which indicates that the child process has finished executing
child.on("close", (code) => {
  // Logging the exit code of the child process to the console
  console.log(`Child process exited with code ${code}`);
});
