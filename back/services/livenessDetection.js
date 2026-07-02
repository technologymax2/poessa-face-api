const checkLiveness = async (selfieImage) => {
  console.log("Checking liveness:", selfieImage);

  return {
    live: true,
    score: 0.99,
  };
};

module.exports = checkLiveness;