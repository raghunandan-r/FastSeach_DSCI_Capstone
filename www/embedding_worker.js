//const maxLength = 400;

function getTopWords(corpus, limit = 5000) {
  // Check if corpus is defined and is an array
  if (!Array.isArray(corpus)) {
    console.error("getTopWords: corpus is not an array");
    return [];
  }

  const wordFrequency = {};

  corpus.forEach((doc, docIndex) => {
    // Check if each document is an array
    if (!Array.isArray(doc)) {
      console.error(`getTopWords: Document at index ${docIndex} is not an array`);
      return; // Skip this document
    }

    doc.forEach(word => {
      // Assuming word is a string; additional checks can be added if needed
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
  });

  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(entry => entry[0]);
}

function createWordIndexMap(corpus) {
  const topWords = getTopWords(corpus, 5000); // Limit to top 5000 words
  let wordIndexMap = new Map();
  topWords.forEach((word, index) => {
    wordIndexMap.set(word, index);
  });

  console.log('wordIndexMap', wordIndexMap);
  return wordIndexMap;
}


let idfMap = new Map();


function calculateTF(wordList, wordIndexMap) {
    let tfDict = {};
    let wordCount = wordList.length;
    let wordFrequency = {};
  
    wordList.forEach((word) => {
      if (wordIndexMap.has(word)) { // Only consider top words
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
  
    for (let word in wordFrequency) {
      tfDict[word] = wordFrequency[word] / wordCount;
    }
    
    return tfDict;
  }
  
  function calculateIDF(corpus, wordIndexMap) {
    if (!corpus || !Array.isArray(corpus)) {
      throw new Error("Invalid corpus: Expected an array.");
    }
    if (!(wordIndexMap instanceof Map)) {
        throw new Error("Invalid wordIndexMap: Expected a Map.");
    }

    let n = corpus.length;
    let idfDict = new Map();

    wordIndexMap.forEach((_, word) => {
        let count = corpus.reduce((acc, doc) => acc + doc.includes(word), 0);
        idfDict.set(word, Math.log((n + 1) / (count + 1)) + 1); // Added 1 to prevent division by zero
    });
    
  return idfDict;
  }

  function calculateTFIDF(tfDict, idfDict, wordIndexMap) {
    let tfidfDict = {};
  
    for (let word in tfDict) {
      if (idfDict.has(word) && wordIndexMap.has(word)) { // Check if the word is in both idfDict and wordIndexMap
        tfidfDict[word] = tfDict[word] * idfDict.get(word); // Use get method for idfDict
      }
    }
   
    return tfidfDict;
  }
  
  function tfidfDictToDenseVector(tfidfDict, wordIndexMap) {
    let denseVector = new Array(wordIndexMap.size).fill(0);
    for (let word in tfidfDict) {
      if (wordIndexMap.has(word)) {
        let index = wordIndexMap.get(word);
        denseVector[index] = tfidfDict[word];
      }
    }
    return denseVector;
  }
    
  function embedFrequency(corpus, wordIndexMap, searchResultsData) {
    
    let idfDict = calculateIDF(corpus, wordIndexMap);
  
    searchResultsData.forEach(result => {
      let tfDict = calculateTF(result.preprocessedResults, wordIndexMap);
      let tfidfDict = calculateTFIDF(tfDict, idfDict, wordIndexMap);
      let tfidfVector = tfidfDictToDenseVector(tfidfDict, wordIndexMap);
      //result.vectors = tfidfVector;
      result.vectors = padding(tfidfVector);
    });
  
    return searchResultsData;
  }
  
  function padding(vectors){
    const maxLength = 5000;
    const currentLength = vectors.length;

    if (currentLength > maxLength) {
        // Truncate the vectors to the first 10k elements
        return vectors.slice(0, maxLength);
    } else if (currentLength < maxLength) {
        // Calculate padding length and pad with zeroes
        const paddingLength = maxLength - currentLength;
        return vectors.concat(new Array(paddingLength).fill(0));
    } else {
        // Return the vectors as is if its length is already 5k
        return vectors;
    }
}

  
  self.addEventListener('message', event => {
    const corpus = event.data[0];
    const searchResultsData = event.data[1];
    const wordIndexMap = createWordIndexMap(corpus); // Create the word index mapping

    // Perform preprocessing and vectorization
    const vectorizedData = embedFrequency(corpus, wordIndexMap, searchResultsData);
    // Send the vectorized data back to the main script
    self.postMessage(vectorizedData);
  });
  