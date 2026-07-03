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
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", () => {

      console.log("===== Liveness STDOUT =====");
      console.log(output);

      console.log("===== Liveness STDERR =====");
      console.log(errorOutput);

      try {

        const lines = output
          .trim()
          .split("\n")
          .filter(line => line.trim());

        const json = JSON.parse(lines[lines.length - 1]);

        resolve(json);

      } catch (err) {

        reject(new Error("Cannot parse Liveness output:\n" + output));

      }

    });

  });
};

module.exports = checkLiveness;
