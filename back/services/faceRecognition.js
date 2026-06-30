// Temporary mock implementation

const compareFaces = async (registeredImage, selfieImage) => {
  console.log("Comparing:");
  console.log(registeredImage);
  console.log(selfieImage);

  // TODO: Replace with real AI service
  return {
    match: true,
    similarity: 0.98,
  };
};

module.exports = compareFaces;