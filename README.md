
# Project Readme: FastSearch - Enhancing Web Search Experience

## Project Overview
FastSearch is a project aimed at improving user experience in web searches. It leverages active learning to re-rank search results based on user engagement, with the goal of increasing click-through rates on subsequent pages.

## Features
- **User Engagement Analysis**: Utilizes implicit feedback from users' interactions with search results to infer relevance.
- **Minimal Onboarding**: Easy accessibility with minimal user onboarding required. Features a prototype web application mimicking a search engine.
- **Dynamic Search Result Re-ranking**: Ranks search results based on user behavior and similarity scores.

## Getting Started

### Installation
- The project is currently in a prototype phase and is accessible at https://gifted-delightful-palladium.glitch.me/.

## Usage
Users interact with the web application, which mimics a search engine. The application re-ranks search results based on the users' interactions with initial results.

## Data Description
Data is scraped from the Bing search engine as per user queries. The first 10 results are shown to users and used for model training, while additional results are stored for later processing.

## Methodology
1. **Data Collection**: Scraping search result data from Bing.
2. **Preprocessing and Embedding**: Filtering top words by frequency and creating a tf-idf matrix.
3. **User Behavior Analysis**: Analyzing user interactions through surveys to improve search algorithms.
4. **Machine Learning Implementation**: Used active learning methodology to update the training dataset with user interactions and a tuned linearSVM model to classify relevant results.
5. **Performance Analysis**: Used the Hall dataset from literature review to evaluate classifier performance.
6. **Ranking Algorithm Implementation**: Utilized dot product for predicting similarity scores between test and train data.
7. **Result Evaluation**: Measured effectiveness through metrics like click-through rate and no. of relevant results in next page results.

## Results and Discussion
The project demonstrated improvement in classifying relevant results and achieved better accuracy and f1-scores. The precision metric, however, remains an area for improvement.

## Issues and Future Work
- **User Experience**: Addressing limitations in user experience due to restricted search result numbers and intended flow.
- **Precision Improvement**: Exploring advanced methods like universal-sentence-encoder (USE) and language embeddings for precision enhancement.
- **Application Expansion**: Considering the extension of the application to systematic literature review platforms like Google Scholar.

## References
- The project references studies in systematic literature review and information retrieval, focusing on active learning and semi-supervised learning methods.

## Conclusion
FastSearch offers a novel approach to enhancing web search results dynamically. It prioritizes user-friendliness and efficient processing, contributing to the research in enhancing literature reviews.