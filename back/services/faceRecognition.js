const { execFile } = require("child_process");
const path = require("path");

const compareFaces = (registeredImage, selfieImage) => {
  return new Promise((resolve, reject) => {
    const script = path.join(__dirname, "../python/compare.py");

    execFile(
      "python",
      [script, registeredImage, selfieImage],
      (err, stdout) => {
        if (err) return reject(err);

        resolve(JSON.parse(stdout));
      }
    );
  });
};

module.exports = compareFaces;
