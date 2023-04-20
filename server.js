const http = require('http');
const express = require("express");
const app = express();
const server = http.createServer(app);

// Serve all the files in 'www'.
app.use(express.static("www"));

// If no file specified in a request, default to index.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/www/index.html");
});

// Start the web server.
const listener = server.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});