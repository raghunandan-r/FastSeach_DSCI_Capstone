/**
 * Predicts the similarity score between a weight vector, bias value, and input vector using dot product.
 * @param {Array<number>} weights - An array of numbers representing the weight vector.
 * @param {number} bias - A number representing the bias value.
 * @param {Array<number>} vector - An array of numbers representing the input vector.
 * @returns {number} A number representing the predicted similarity score between the weight vector, bias value, and input vector.
 */

function magnitude(vec) {
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(A, B) {
  if (A.length !== B.length) {
    return null; // or throw an error
  }

  let dotProduct = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
  }
  
  const denominator = magnitude(A) * magnitude(B);
  if (denominator === 0) {
    return 0;
  }
  
  return dotProduct / denominator;
}


class LinearSVM {
  constructor(C = 1.0) {
    this.C = C; // Regularization parameter    
  }

  // Linear kernel (dot product)
  dotProduct(v1, v2) {
    let sum = 0;
    for (let i = 0; i < v1.length; i++) {
      sum += v1[i] * v2[i];
    }
    return sum;
  }


  // Make a prediction
  predict(vec, weights, bias) {
    const result = this.dotProduct(weights, vec) + bias;
    //return result >= 0 ? 1 : -1;
    return result;
  }
  
  similarity( weights, vec) {
    return cosineSimilarity(weights, vec);
  }
}


  
// event listener for incoming messages
self.addEventListener("message", function (event) {
  model = event.data[0];
  testData = event.data[1];
  const svm = new LinearSVM();  
  
  testData = testData.map(obj =>{
      obj.similarity = svm.similarity( model.weights, obj.vectors);
      return obj;
    })
  // sort testdata basis the similarity scores
  testData = testData.sort((a, b) => b.similarity - a.similarity);
  self.postMessage(testData);
});