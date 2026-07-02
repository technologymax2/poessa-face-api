const compareFaces = async (registeredImage, selfieImage) => {
  console.log("Comparing:");
  console.log(registeredImage);
  console.log(selfieImage);

  return {
    match: true,
    similarity: 0.98,
  };
};

module.exports = compareFaces;