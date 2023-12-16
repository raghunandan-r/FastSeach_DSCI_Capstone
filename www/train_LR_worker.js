/**
 * Represents a linear support vector machine for classification.
 */
class LinearSVM {
  /**
   * Constructs a LinearSVM instance with a regularization parameter C.
   * @param {number} C - The regularization parameter.
   */
  constructor(C = 1.0) {
    this.C = C; // Regularization parameter
    this.weights = []; // Array to hold the weights of the model
    this.bias = 0; // Numeric bias of the model
  }

  /**
   * Computes the dot product of two vectors.
   * @param {Array<number>} v1 - The first vector.
   * @param {Array<number>} v2 - The second vector.
   * @returns {number} The dot product of the two vectors.
   */
  dotProduct(v1, v2) {
    let sum = 0;
    for (let i = 0; i < v1.length; i++) {
      sum += v1[i] * v2[i];
    }
    return sum;
  }

  /**
   * Trains the SVM using the provided data and labels.
   * @param {Array<Array<number>>} data - The training data.
   * @param {Array<number>} labels - The labels for the training data.
   * @param {number} learningRate - The learning rate for the training algorithm.
   * @param {number} epochs - The number of epochs to run the training for.
   * @returns {Object} An object containing the trained weights and bias.
   */
  train(data, labels, learningRate = 0.001, epochs = 50) {
    const n = data.length; // Number of data points
    const d = data[0].length; // Dimension of each data point
    const classWeights = calculateClassWeights(labels); // Calculate class weights for balancing
    console.log(`Class Weights: ${JSON.stringify(classWeights)}`);

    this.weights = Array(d).fill(0); // Initialize weights as zeros
    this.bias = 0; // Initialize bias as zero

    for (let epoch = 1; epoch <= epochs; epoch++) {
      for (let i = 0; i < n; i++) {
        const xi = data[i];
        const yi = labels[i];
        const classWeight = classWeights[yi.toString()];
        const margin = yi * (this.dotProduct(this.weights, xi) + this.bias);

        // Update weights and bias based on margin condition
        if (margin >= 1) {
          for (let j = 0; j < d; j++) {
            this.weights[j] -= learningRate * this.C * this.weights[j];
          }
        } else {
          for (let j = 0; j < d; j++) {
            this.weights[j] -= learningRate * (this.C * this.weights[j] - classWeight * xi[j] * yi);
          }
          this.bias -= learningRate * (-yi * classWeight);
        }
      }
    }
    
    return { weights: this.weights, bias: this.bias }; // Return the trained model
  }
}

/**
 * Calculates class weights for balancing the SVM training.
 * @param {Array<number>} labels - The labels of the training data.
 * @returns {Object} An object mapping each label to its calculated weight.
 */
function calculateClassWeights(labels) {
  let classFrequency = { '-1': 0, '1': 0 }; // Initialize frequency counts
  labels.forEach(label => {
    classFrequency[label.toString()]++; // Count frequency of each label
  });

  let total = labels.length;
  let classWeights = {};

  // Calculate class weights for balancing
  for (const key in classFrequency) {
    if (classFrequency[key] !== 0) {
      classWeights[key] = total / classFrequency[key];
    } else {
      classWeights[key] = 0;
    }
  }

  return classWeights; // Return the calculated class weights
}

/**
 * Event listener for incoming messages, used for training the SVM.
 */
self.addEventListener("message", event => {
  let trainData = event.data[0]; // Training data
  let trainDataVecs = trainData.map(obj => obj.vectors); // Extract vectors from the data
  let labels = trainData.map(obj => obj.clicks); // Extract labels from the data

  let startTime = new Date(); // Record start time of training
  const svm = new LinearSVM(5); // Initialize LinearSVM with regularization parameter
  const model = svm.train(trainDataVecs, labels); // Train the model
  let endTime = new Date(); // Record end time of training
  const timeDiff = (endTime - startTime) / 1000; // Calculate training time in seconds
  console.log(`Time taken for training: ${timeDiff} seconds`);

  self.postMessage(model); 
});
