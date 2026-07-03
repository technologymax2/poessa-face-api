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

    python.on("close", (code) => {
  try {
    console.log("DeepFace Output:\n", data);

    const lines = data
      .trim()
      .split("\n")
      .filter(line => line.trim());

    const jsonLine = lines[lines.length - 1];

    resolve(JSON.parse(jsonLine));
  } catch (err) {
    console.error("Face JSON Parse Error:", err);
    console.error("Raw Output:", data);
    reject(err);
  }
});
  });
};

module.exports = compareFaces;
