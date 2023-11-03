//const maxLength = 400;
let tfMap = new Map();
let idfMap = new Map();

function calculateTF(wordList){
    let tfDict = {};
    let wordCount = wordList.length;
    let wordFrequency = {};

    wordList.forEach((word) => {
        if (!wordFrequency[word]) {
            wordFrequency[word] = 1;
        } else {
            wordFrequency[word] += 1;
        }
    });

    for(let word in wordFrequency){
        tfDict[word] = wordFrequency[word]/wordCount;
    }

    return tfDict;
}

function calculateIDF(docList){
    let n = docList.length;
    let idfDict = {};

    let wordSet = new Set();
    docList.forEach((doc) => {
        doc.forEach((word) => {
            wordSet.add(word);
        });
    });

    wordSet.forEach((word) => {
        let count = 0;
        docList.forEach((doc) => {
            if (doc.includes(word)) {
                count += 1;
            }
        });
        idfDict[word] = Math.log(n/count);
    });

    return idfDict;
}

function calculateTFIDF(tfList, idfDict){
    let tfidfDict = {};

    for(let word in tfList){
        tfidfDict[word] = tfList[word] * idfDict[word];
    }

    return tfidfDict;
}

function tfidfDictToVector(tfidfDict, idfMap) {
    let vector = [];
    for(let word in idfMap) {
        if(tfidfDict[word]) {
            vector.push(tfidfDict[word]);
        } else {
            vector.push(0);
        }
    }
    return vector;
}

/**
 * Embeds the frequency of each word in a preprocessed search query into an array of search result objects.
 * @param {Map<string, number>} freqMap - A Map object containing the frequencies of words.
 *
 * @param {Array<Object>} searchResultsData - An array of objects representing search results data.
 * @returns {Array<Object>} An array of search result objects with frequency vectors embedded.
 */
function embed_freq(corpus, searchResultsData){
  
    idfMap = calculateIDF(corpus);

    searchResultsData.forEach(result => {
        let tfDict = calculateTF(result.preprocessedResults);
        let tfidfDict = calculateTFIDF(tfDict, idfMap);
        let tfidfVector = tfidfDictToVector(tfidfDict, idfMap);
        result.vectors.push(tfidfVector);
        result.vectors = padding(result.vectors);
    });
    
    return searchResultsData;
}

/**
 * Pads an array of vectors with zeros to a fixed length.
 * @param {Array<number>} vectors - An array of numbers representing a vector.
 * @returns {Array<number>} An array of numbers representing the padded vector.
 */
function padding(vectors){
    const maxLength = 2000;
    const currentLength = vectors.length;

    if (currentLength > maxLength) {
        // Truncate the vectors to the first 10k elements
        return vectors.slice(0, maxLength);
    } else if (currentLength < maxLength) {
        // Calculate padding length and pad with zeroes
        const paddingLength = maxLength - currentLength;
        return vectors.concat(new Array(paddingLength).fill(0));
    } else {
        // Return the vectors as is if its length is already 10k
        return vectors;
    }
}


self.addEventListener('message', event => {
    
    const corpus = event.data[0];
    const searchResultsData = event.data[1];
    
    // Perform preprocessing and vectorization
    const vectorizedData = embed_freq(corpus, searchResultsData);
    // Send the vectorized data back to the main script
    self.postMessage(vectorizedData);
});