const { exec } = require('child_process');

function reloadServer() {
  exec('pm2 reload my-app', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error reloading server: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    console.log(`Server reloaded successfully: ${stdout}`);
  });
}

module.exports = reloadServer;
