const { exec } = require('child_process');

function executeCommand(customCommand) {
  exec(customCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error}`);
      return;
    }
    console.log(`Command output: ${stdout}`);
    console.error(`Command errors: ${stderr}`);

    // Call the function again with the custom command
    executeCommand(customCommand);
  });
}

// Get the custom command from command line arguments
const customCommand = process.argv[2];

// Check if a custom command was provided
if (!customCommand) {
  console.error('Please provide a custom command.');
  console.error('example: node hold.js ur command here');
  process.exit(1);
}

// Start the loop with the custom command
executeCommand(customCommand);
