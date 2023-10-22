// list of stopwords to remove from the results data before feeding to the model.
let stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now'];
let corpus = [];
let freqMap = new Map();

/**
 * Removes duplicate items from an array of search result objects based on their URL property.
 * @param {Array<Object>} searchResultsData - An array of objects representing search results data.
 * @returns {Array<Object>} An array of unique search result objects.
 */
function removeDuplicates(searchResultsData){
    const uniqueItems = searchResultsData.filter((item, index) => {
        return index === searchResultsData.findIndex(obj => {
          return obj.url === item.url;
        });
      });

    return uniqueItems;
}

/**
 * Removes non-alphanumeric characters and multiple consecutive whitespace characters from a string of text.
 * @param {string} text - A string of text to be cleaned.
 * @returns {string} A cleaned string of text.
 */
function clearText(text) {
    return text
      .toLowerCase()
      .replace(/[^A-Za-zА-Яа-яЁёЇїІіҐґЄє0-9\-]|\s]/g, " ")
      .replace(/\s{2,}/g, " ");
}
  
/**
 * Removes stopwords from a string of text and returns a string of remaining words joined with a space.
 * @param {string} text - A string of text to be filtered for stopwords.
 * @returns {string} A string of filtered text without stopwords.
 */
function removeStopwords(text){
    res = []
    words = text.split(' ')
    for(let i=0;i<words.length;i++) {
        word_clean = words[i].split(".").join("")
        if(!stopwords.includes(word_clean)) {
            res.push(word_clean)
        }
    }
    return(res.join(' '))
}
  
/**
 * Tokenizes a string of text into an array of words based on non-word characters.
 * @param {string} text - A string of text to be tokenized.
 * @returns {Array<string>} An array of words.
 */
function tokenizer(text){
    return text.split(/\W+/);
}

 
/**
 * Processes an array of search result objects by removing duplicates, preprocessing snippets of text, creating frequency maps, and initializing properties.
 * @param {Array<Object>} searchResultsData - An array of objects representing search results data.
 * @returns {Array<Object>} An array of preprocessed search result objects.
 */
function preprocessing(searchResultsData) {
    //searchResultsData = removeDuplicates(searchResultsData);

    searchResultsData.forEach(result =>{
        let preprocessedResult = clearText(result.snippet);
        preprocessedResult = removeStopwords(preprocessedResult);
        let tokenizedWords = tokenizer(preprocessedResult);
        result.preprocessedResults = tokenizedWords;
        result.vectors = [];
        result.clicks = 0;
        corpus.push(tokenizedWords);
        
    })

    return searchResultsData;
}


self.addEventListener('message', event => {
    searchResultsData = event.data[0];
    
    // Perform preprocessing and vectorization
    const preprocessedData = preprocessing(searchResultsData);    
    self.postMessage([preprocessedData,corpus]);
});