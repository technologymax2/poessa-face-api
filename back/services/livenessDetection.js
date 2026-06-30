// Temporary mock implementation

const checkLiveness = async (selfieImage) => {
  console.log("Checking liveness:", selfieImage);

  // TODO: Replace with real AI service
  return {
    live: true,
    score: 0.99,
  };
};

module.exports = checkLiveness;