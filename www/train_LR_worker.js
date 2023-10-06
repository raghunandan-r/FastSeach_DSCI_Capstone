
/**
 * Trains a linear regression model using the given training data.
 * @param {Array} trainData - An array of objects containing preprocessed search results data, vectors and clicks.
 * @returns {Object} - An object containing the trained weights and bias.
*/
class LinearSVM {
  constructor(C = 1.0) {
    this.C = C; // Regularization parameter
    this.weights = [];
    this.bias = 0;
  }

  // Linear kernel (dot product)
  dotProduct(v1, v2) {
    let sum = 0;
    for (let i = 0; i < v1.length; i++) {
      sum += v1[i] * v2[i];
    }
    return sum;
  }

  // Train the SVM
  train(data, labels, learningRate = 0.001, epochs = 1000) {
    const n = data.length;
    const d = data[0].length;

    this.weights = Array(d).fill(0);
    this.bias = 0;

    for (let epoch = 1; epoch < epochs; epoch++) {
      for (let i = 0; i < n; i++) {
        const xi = data[i];
        const yi = labels[i];
        const margin = yi * (this.dotProduct(this.weights, xi) + this.bias);

        if (margin >= 1) {
          // Correctly classified and outside the margin
          for (let j = 0; j < d; j++) {
            //this.weights[j] -= learningRate * (2 * 1/epoch * this.weights[j]);
            this.weights[j] -= learningRate * this.C * this.weights[j];
          }
        } else {
          for (let j = 0; j < d; j++) {
            // Regularization and hinge loss, both scaled by C
            this.weights[j] -= learningRate * (this.C * this.weights[j] - xi[j] * yi);
          }
          this.bias -= learningRate * (-yi);
        }
      }
    }
    
    return {weights: this.weights, bias: this.bias};
  }

  // Make a prediction
  predict(vec) {
    const result = this.dotProduct(this.weights, vec) + this.bias;
    return result >= 0 ? 1 : -1;
  }
}




  
// event listener for incoming messages
self.addEventListener("message", event=> {
  let trainData = event.data[0];
  // Train the linear regression model
  //const model = trainLinearRegressionModel(trainData);  
  const svm = new LinearSVM();  
  let labels = trainData.map(obj=> obj.clicks)
  let trainDataVecs = trainData.map(obj=> obj.vectors)
  const model = svm.train(trainDataVecs, labels);
  // Send the trained model back to the main thread
  self.postMessage(model);
});