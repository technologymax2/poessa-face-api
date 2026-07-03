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

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {

      console.log("===== DeepFace STDOUT =====");
      console.log(output);

      console.log("===== DeepFace STDERR =====");
      console.log(errorOutput);

      try {
        const lines = output
          .trim()
          .split("\n")
          .filter(line => line.trim());

        const json = JSON.parse(lines[lines.length - 1]);

        resolve(json);

      } catch (err) {

        reject(new Error("Cannot parse DeepFace output:\n" + output));

      }

    });

  });
};

module.exports = compareFaces;
