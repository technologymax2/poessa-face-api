const { spawn } = require("child_process");
const path = require("path");

const compareFaces = (registeredImage, selfieImage) => {
  return new Promise((resolve, reject) => {

    const script = path.join(__dirname, "../python/compare.py");

    const python = spawn("python", [
      script,
      path.join(__dirname, "..", registeredImage),
      path.join(__dirname, "..", selfieImage),
    ]);

    let data = "";

    python.stdout.on("data", chunk => {
      data += chunk.toString();
    });

    python.stderr.on("data", err => {
      console.error(err.toString());
    });

    python.on("close", () => {
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });

  });
};

module.exports = compareFaces;
