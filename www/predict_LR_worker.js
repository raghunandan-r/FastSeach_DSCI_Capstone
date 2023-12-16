/**
 * Represents a linear support vector machine for making predictions.
 */
class LinearSVM {
  /**
   * Constructs a LinearSVM instance with a given model.
   * @param {Object} model - The model containing the weights and bias.
   */
  constructor(model) {
    this.weights = model.weights; // Sparse array representing the weights of the model
    this.bias = model.bias; // Numeric bias of the model
  }

  /**
   * Computes the dot product of two sparse vectors.
   * @param {Array<Object>} v1 - The first sparse vector.
   * @param {Array<Object>} v2 - The second sparse vector.
   * @returns {number} The dot product of the two vectors.
   */
  dotProductSparse(v1, v2) {
    let sum = 0;
    let i = 0, j = 0;
    while (i < v1.length && j < v2.length) {
      if (v1[i].index === v2[j].index) {
        sum += v1[i].value * v2[j].value;
        i++;
        j++;
      } else if (v1[i].index < v2[j].index) {
        i++;
      } else {
        j++;
      }
    }
    return sum;
  }

  /**
   * Computes the dot product of two vectors.
   * @param {Array<number>} v1 - The first vector.
   * @param {Array<number>} v2 - The second vector.
   * @returns {number} The dot product of the two vectors.
   */
  dotProduct(v1, v2) {
    if (!v1 || !v2) {
      console.error("One of the vectors is undefined", v1, v2);
      return 0;
    }

    let sum = 0;
    for (let i = 0; i < v1.length; i++) {
      sum += v1[i] * v2[i];
    }
    return sum;
  }

  /**
   * Makes a prediction for a given sparse vector.
   * @param {Array<Object>} vec - The sparse vector for which to make the prediction.
   * @returns {number} The predicted value.
   */
  predict(vec) {
    if (!vec) {
      console.error("Undefined vector passed to predict", vec);
      return -1; // or handle this scenario appropriately
    }
    const result = this.dotProduct(this.weights, vec) + this.bias;
    return result; // >= 0 ? 1 : -1;
  }
}

/**
 * Event listener for incoming messages, used for making predictions.
 */
self.addEventListener("message", function (event) {
  const model = event.data[0]; // Contains the weights and bias
  let testData = event.data[1]; // Array of objects containing the sparse vectors

  const svm = new LinearSVM(model);  
  
  // Map each test data point to include a similarity score based on dot product
  testData = testData.map(obj => {
    if (!obj.vectors) {
      console.error("Undefined vectors in testData", obj);
    } else {
      obj.similarity = svm.predict(obj.vectors);
    }
    return obj;
  });
  
  // The testData array is now updated with similarity scores for each object
  testData = testData.sort((a, b) => b.similarity - a.similarity);
  console.log("testData from predict",testData);
  self.postMessage(testData); // Send the updated testData array back to the main thread
});
