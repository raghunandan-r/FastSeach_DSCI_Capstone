# bing-E-search

Bing-E is a search result optimization web app engine that takes into account human implicit feedback to rank search results. 

When a user interacts with a search result (for example, by clicking on it), our engine interprets the interaction as 
implicit positive feedback. Results that are not yet shown to the user are reranked based on their similarity to the user feedback. 
Our solution considers clicks on web pages as feedback and also currently limited to only positive feedback. 
Refer our project here - https://www.overleaf.com/read/xmcfkpnvksqd 

## Usage

To use the tool, just head to https://bing-e-search.glitch.me/ in your web browser. For the time being, we need you to manually input the 'Bing' API key in the developer console. 
When you enter a search query, the tool will retrieve search results and display them on the page. Clicking on search results, will be recorded as implicit feedback and used to improve future search rankings.
Please check if the **next page results** are *more* relevant based on the links you have clicked. 

## Future Development

In the future, the tool aims to include additional context such as time spent on websites, cross-session activity, and more. The tool also aims 
to improve the algorithm used to rank search results based on implicit feedback.

