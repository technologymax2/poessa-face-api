
const { spawn } = require("child_process");
const path = require("path");

const checkLiveness = (imagePath) => {
  return new Promise((resolve, reject) => {

    const script = path.join(__dirname, "../python/liveness.py");

    const python = spawn("python", [
      script,
      path.join(__dirname, "..", imagePath),
    ]);

    let output = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    python.on("close", () => {
      try {
        resolve(JSON.parse(output));
      } catch (err) {
        reject(err);
      }
    });

  });
};

module.exports = checkLiveness;
