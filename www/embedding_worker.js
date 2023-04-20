const maxLength = 400;

/**
 * Embeds the frequency of each word in a preprocessed search query into an array of search result objects.
 * @param {Map<string, number>} freqMap - A Map object containing the frequencies of words.
 *
 * @param {Array<Object>} searchResultsData - An array of objects representing search results data.
 * @returns {Array<Object>} An array of search result objects with frequency vectors embedded.
 */
function embed_freq(freqMap, searchResultsData){
    searchResultsData.forEach(results =>{
        results.preprocessedResults.forEach(word =>{
            results.vectors.push(freqMap.get(word));
        })
        results.vectors = padding(results.vectors);
    })
    return searchResultsData;
}

/**
 * Pads an array of vectors with zeros to a fixed length.
 * @param {Array<number>} vectors - An array of numbers representing a vector.
 * @returns {Array<number>} An array of numbers representing the padded vector.
 */
function padding(vectors){
    const paddingLength = maxLength - vectors.length;
    return vectors.concat(new Array(paddingLength).fill(0));
}


self.addEventListener('message', event => {
    const searchResultsData = event.data[1];
    const freqMap = event.data[0];
    // Perform preprocessing and vectorization
    const vectorizedData = embed_freq(freqMap, searchResultsData);
    // Send the vectorized data back to the main script
    self.postMessage(vectorizedData);
});