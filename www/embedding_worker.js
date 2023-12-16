/**
 * Extracts the top words from a corpus based on frequency.
 * @param {Array<Array<string>>} corpus - The corpus, an array of documents, each represented as an array of words.
 * @param {number} limit - The maximum number of top words to extract.
 * @returns {Array<string>} An array of the most frequent words up to the specified limit.
 */
function getTopWords(corpus, limit = 5000) {
  if (!Array.isArray(corpus)) {
    console.error("getTopWords: corpus is not an array");
    return [];
  }

  const wordFrequency = {};

  corpus.forEach((doc, docIndex) => {
    if (!Array.isArray(doc)) {
      console.error(`getTopWords: Document at index ${docIndex} is not an array`);
      return;
    }

    doc.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
  });

  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(entry => entry[0]);
}

/**
 * Creates a mapping from words to their index based on frequency in the corpus.
 * @param {Array<Array<string>>} corpus - The corpus to analyze.
 * @returns {Map<string, number>} A Map where each key is a word and its value is the corresponding index.
 */
function createWordIndexMap(corpus) {
  const topWords = getTopWords(corpus, 5000);
  let wordIndexMap = new Map();
  topWords.forEach((word, index) => {
    wordIndexMap.set(word, index);
  });

  console.log('wordIndexMap', wordIndexMap);
  return wordIndexMap;
}

/**
 * Calculates term frequency (TF) for a list of words.
 * @param {Array<string>} wordList - The list of words in a document.
 * @param {Map<string, number>} wordIndexMap - A Map containing the indices of top words.
 * @returns {Object} An object with word frequencies normalized by the total number of words.
 */
function calculateTF(wordList, wordIndexMap) {
  let tfDict = {};
  let wordCount = wordList.length;
  let wordFrequency = {};

  wordList.forEach((word) => {
    if (wordIndexMap.has(word)) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });

  for (let word in wordFrequency) {
    tfDict[word] = wordFrequency[word] / wordCount;
  }

  return tfDict;
}

/**
 * Calculates inverse document frequency (IDF) for the corpus.
 * @param {Array<Array<string>>} corpus - The corpus of documents.
 * @param {Map<string, number>} wordIndexMap - A Map containing the indices of top words.
 * @returns {Map<string, number>} A Map with IDF values for each word.
 */
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
    idfDict.set(word, Math.log((n + 1) / (count + 1)) + 1);
  });

  return idfDict;
}

/**
 * Combines TF and IDF dictionaries to calculate TF-IDF.
 * @param {Object} tfDict - The term frequency dictionary.
 * @param {Map<string, number>} idfDict - The inverse document frequency Map.
 * @param {Map<string, number>} wordIndexMap - A Map containing the indices of top words.
 * @returns {Object} An object containing the TF-IDF values for each word.
 */
function calculateTFIDF(tfDict, idfDict, wordIndexMap) {
  let tfidfDict = {};

  for (let word in tfDict) {
    if (idfDict.has(word) && wordIndexMap.has(word)) {
      tfidfDict[word] = tfDict[word] * idfDict.get(word);
    }
  }

  return tfidfDict;
}

/**
 * Converts a TF-IDF dictionary to a dense vector representation.
 * @param {Object} tfidfDict - The TF-IDF dictionary.
 * @param {Map<string, number>} wordIndexMap - A Map containing the indices of top words.
 * @returns {Array<number>} A dense vector representation of the TF-IDF values.
 */
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

/**
 * Prepares search result data by calculating TF-IDF vectors for each document.
 * @param {Array<Array<string>>} corpus - The corpus of documents.
 * @param {Map<string, number>} wordIndexMap - A Map containing the indices of top words.
 * @param {Array<Object>} searchResultsData - The search results data to be processed.
 * @returns {Array<Object>} Updated search results data with TF-IDF vectors included.
 */
function embedFrequency(corpus, wordIndexMap, searchResultsData) {
  let idfDict = calculateIDF(corpus, wordIndexMap);

  searchResultsData.forEach(result => {
    let tfDict = calculateTF(result.preprocessedResults, wordIndexMap);
    let tfidfDict = calculateTFIDF(tfDict, idfDict, wordIndexMap);
    let tfidfVector = tfidfDictToDenseVector(tfidfDict, wordIndexMap);
    result.vectors = padding(tfidfVector);
  });

  return searchResultsData;
}

/**
 * Pads or truncates vectors to a fixed length.
 * @param {Array<number>} vectors - The vector to be padded or truncated.
 * @returns {Array<number>} A vector of fixed length.
 */
function padding(vectors) {
  const maxLength = 5000;
  const currentLength = vectors.length;

  if (currentLength > maxLength) {
    return vectors.slice(0, maxLength);
  } else if (currentLength < maxLength) {
    const paddingLength = maxLength - currentLength;
    return vectors.concat(new Array(paddingLength).fill(0));
  } else {
    return vectors;
  }
}

/**
 * Event listener for incoming messages, used for processing search results.
 */
self.addEventListener('message', event => {
  const corpus = event.data[0];
  const searchResultsData = event.data[1];
  const wordIndexMap = createWordIndexMap(corpus);

  const vectorizedData = embedFrequency(corpus, wordIndexMap, searchResultsData);
  self.postMessage(vectorizedData);
});
