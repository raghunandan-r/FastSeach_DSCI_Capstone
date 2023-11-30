// Declare and initialize constants

const searchForm = document.querySelector('#search-form');
const searchResults = document.querySelector('#search-results');
const pagination = document.querySelector('#pagination');
const prevPageButton = document.querySelector('#prev-page');
const nextPageButton = document.querySelector('#next-page');
const pageNumber = document.querySelector('#page-number');
const totalPageCount = document.querySelector('#total-pages');

// Declare and initialize variables
let currentPage = 1;
let totalResults = 0;
let totalPages = 0;
let currentOffset = 0;
let searchResultsData = [];    // storing all the results data json
let resultsToDisplay = [];     // storing a subset of results to display in a page
let newSearchResultsData =[];  // querying and storing more results to concatenate to searchResultsData
let previousTotalResults = 0;  
let clickedUrls = [];
let freqMap = new Map();       // storing the frequency map of text in search results
let trainData = [];
let testData = [];
var model;

// Event listener for when you click on search button
searchForm.addEventListener('submit', event => {
  // location.reload(true);
  event.preventDefault();
  const searchTerm = searchForm.elements['search-term'].value;
  currentOffset = 0;
  currentPage = 1;
  searchBingApi(searchTerm);
});

// Create and linking the worker file for preprocessing the data
let preprocessing_worker = new Worker('preprocessing_worker.js');

// Create and linking the worker file for word embedding
let embedding_worker = new Worker('embedding_worker.js');

// Create and linking the worker file for training linear regression model
let trainWorker = new Worker('train_LR_worker.js');

// Create and linking the worker file for computing similarity scores
let scoreWorker = new Worker('predict_LR_worker.js');

// receives preprocessed data from the preprocessing_worker and passes data to the embedding_worker to obtain word embeddings.
preprocessing_worker.addEventListener('message', event => {
  searchResultsData = event.data[0];
  corpus = event.data[1];  
  console.log('PreProcessing achieved');
  embedding_worker.postMessage([corpus,searchResultsData]);
});

// receives embedded data from the worker and stores the results dataset not yet shown to user in testData.
embedding_worker.addEventListener('message', event => {
  searchResultsData = event.data;
  
  searchResultsData.map(obj =>{    
    obj.clicks = -1;          
    //trainData.push(obj);    
  })
  
  console.log('Embedding Worker acheived',searchResultsData[0]);
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  testData = searchResultsData.slice(endIndex,);  
});


// receives and passes the trained model to the prediction worker 
trainWorker.addEventListener('message', event=> {
  model = event.data;
  console.log('Model Trained');
  console.log(model);
  scoreWorker.postMessage([model,testData]);
});

// receives the testdata reranked per their cosine similarity scores to the clicked results 
scoreWorker.addEventListener('message', event => {
  console.log("Reranked results");

  testData = event.data;
  console.log("testData from bingsearch",testData);
  displaySearchResults();
  updatePagination();
})

/**
 * Pass the search query to Bing API and store results in searchResultsData
 * 
 * @param {string} searchTerm - search query from user
 */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function searchBingApi(searchTerm) {

  // Construct API URL with search term and offset
  const apiUrl = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(searchTerm)}&count=50&offset=${previousTotalResults}`;

  // Fetch data from API
  fetch(apiUrl, {
    headers: {
      "Ocp-Apim-Subscription-Key": "apiKey"  //<-- replace apiKey here.
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Get total number of search results and concatenate with existing search results
    totalResults = Object.keys(data.webPages.value).length;

    previousTotalResults = previousTotalResults + totalResults;
    newSearchResultsData = data.webPages.value;
    
    //checkthis goddamn gpt fix
    if (searchResultsData === undefined || searchResultsData === null) {
      searchResultsData = [];  // Initialize if undefined or null
    }
    searchResultsData = searchResultsData.concat(newSearchResultsData);
    
    if(previousTotalResults>=500){

      // Display search results for first page
      displaySearchResults();
      // Update pagination
      updatePagination();

      preprocessing_worker.postMessage([searchResultsData]);

    }else{
      //sleep before making another call.
      sleep(1000).then(() => {
        console.log("Slept for 1 seconds");
      });
      
      searchBingApi(searchForm.elements['search-term'].value);
    }
    
    
    console.log("Results acquired, Number of results - ",totalResults);
    // Calculate total pages
    totalResults = Object.keys(searchResultsData).length;
    totalPages = Math.ceil(totalResults / 10);
  })
  .catch(error => {
    console.error(error);
  });
}

// Event listener for previous page button
prevPageButton.addEventListener('click', () => {
  currentOffset -= 10;
  currentPage--;
  displaySearchResults();
  updatePagination();
});

// Event listener for next page button
nextPageButton.addEventListener('click', () => {
  currentOffset += 10;
  currentPage++;
  console.log("lenght",Object.keys(trainData).length );
  // If nothing is clicked 
  if(Object.keys(trainData).length == 0){
    console.log("No Clicks recorded")
    displaySearchResults();
    updatePagination();
  }else{
    console.log("Updating ranks")
    // Retrain your model and rerank the results
    trainWorker.postMessage([trainData]);

    // Sort test data based on similarity scores
    //testData.sort((a, b) => b.score - a.score);
  }
});

/**
 * Display search results for current page
 */
function displaySearchResults() {
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  // If no results are clicked
  if(Object.keys(trainData).length == 0){    
    console.log("No clicks recorded for display")
    resultsToDisplay = searchResultsData.slice(startIndex, endIndex); 
    testData = searchResultsData.slice(endIndex,);   
  }
  else{
    console.log("Fetching new ranked results")
    resultsToDisplay = testData.slice(0,10);  
    testData = testData.slice(endIndex,);  
  }
  //testData = searchResultsData.slice(endIndex,);
  
  console.log("resultsToDisplay",searchResultsData[0]);
  let html = '';
  resultsToDisplay.forEach(result => {
    html += `
      <article>
        <h2><a href="${result.url}" target ="_blank">${result.name}</a></h2>
        <p>${result.snippet}</p>
      </article>
    `;
  });
  searchResults.innerHTML = html;
  console.log("Search Results slice displayed for page",currentPage)
  
  //update displayed results to trainingData with clicks initialized negative
    
  
  // Count clicks on hyperlinks
  const hyperlinks = document.querySelectorAll('#search-results a');
  hyperlinks.forEach(hyperlink => {
    hyperlink.addEventListener('click', () => {
      const clickedUrl = hyperlink.href;      
      
      searchResultsData = searchResultsData.map(obj =>{
        if(obj.url == clickedUrl){
          obj.clicks = 1;
          trainData.push(obj);
          console.log('Click acknowledged',clickedUrl);
        }
        return obj;
      })
    });
  });
}

// Function to update pagination and navigation
function updatePagination() {
  pageNumber.textContent = currentPage;
  totalPageCount.textContent = totalPages;

  if (currentPage === 1) {
    prevPageButton.disabled = true;
  } else {
    prevPageButton.disabled = false;
  }

  if (currentPage === totalPages) {
    nextPageButton.disabled = true;
  } else {
    nextPageButton.disabled = false;
  }
  console.log("Pagination Updated for page",currentPage)
}
