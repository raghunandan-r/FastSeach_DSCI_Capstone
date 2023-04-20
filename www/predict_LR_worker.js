/**
 * Predicts the similarity score between a weight vector, bias value, and input vector using dot product.
 * @param {Array<number>} weights - An array of numbers representing the weight vector.
 * @param {number} bias - A number representing the bias value.
 * @param {Array<number>} vector - An array of numbers representing the input vector.
 * @returns {number} A number representing the predicted similarity score between the weight vector, bias value, and input vector.
 */
function predictSimilarityScore(weights, bias, vector) {
  let prediction = 0;
  for (let i = 0; i < weights.length; i++){
    for (let j = 0; j < vector.length; j++) {
        prediction += vector[i] * weights[i];
        }
  }
  prediction += bias;
  return prediction;
}
  
// event listener for incoming messages
self.addEventListener("message", function (event) {
  model = event.data[0];
  testData = event.data[1];
  testData = testData.map(obj =>{
      obj.score = predictSimilarityScore(model.weights, model.bias, obj.vectors);
      return obj;
    })
  // sort testdata basis the similarity scores
  testData = testData.sort((a, b) => a.score - b.score);
  self.postMessage(testData);
});