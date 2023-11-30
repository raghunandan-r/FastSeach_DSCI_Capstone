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
  train(data, labels, learningRate = 0.001, epochs = 50) {
    const n = data.length;
    const d = data[0].length;
    const classWeights = calculateClassWeights(labels);
    console.log(`Class Weights: ${JSON.stringify(classWeights)}`);

    this.weights = Array(d).fill(0);
    this.bias = 0;

    for (let epoch = 1; epoch <= epochs; epoch++) {
      for (let i = 0; i < n; i++) {
        const xi = data[i];
        const yi = labels[i];
        const classWeight = classWeights[yi.toString()];
        const margin = yi * (this.dotProduct(this.weights, xi) + this.bias);

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
    
    return { weights: this.weights, bias: this.bias };
  }

}

// Function to calculate class weights
function calculateClassWeights(labels) {
  let classFrequency = { '-1': 0, '1': 0 }; // or just -1 and 1 if you prefer
  labels.forEach(label => {
    // If labels are numbers, convert them to strings for key access, or just use numbers as keys
    classFrequency[label.toString()]++;
  });
/*
  let total = labels.length;
  let classWeights = {
    '-1': total / (2 * classFrequency['-1']),
    '1': total / (2 * classFrequency['1'])
  };
*/

let total = labels.length;
let classWeights = {};

for (const key in classFrequency) {
  if (classFrequency[key] !== 0) {
    classWeights[key] = total / classFrequency[key];
  } else {
    classWeights[key] = 0;
  }
}

  return classWeights;
}

// Event listener for incoming messages for predictions
self.addEventListener("message", event => {
  let trainData = event.data[0]; 
  let trainDataVecs = trainData.map(obj => obj.vectors);
  let labels = trainData.map(obj => obj.clicks);  

  let startTime = new Date();
  const svm = new LinearSVM(5);  
  const model = svm.train(trainDataVecs, labels);
  let endTime = new Date();
  const timeDiff = (endTime - startTime) / 1000; // divide by 1000 to convert milliseconds to seconds
  console.log(`Time taken for training: ${timeDiff} seconds`);

  self.postMessage(model);
});
