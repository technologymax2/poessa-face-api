
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
    console.log("Liveness Output:\n", output);

    const lines = output
      .trim()
      .split("\n")
      .filter(line => line.trim());

    const jsonLine = lines[lines.length - 1];

    resolve(JSON.parse(jsonLine));
  } catch (err) {
    console.error("Liveness JSON Parse Error:", err);
    console.error("Raw Output:", output);
    reject(err);
  }
});

  });
};

module.exports = checkLiveness;
