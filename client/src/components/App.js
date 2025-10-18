// Import the built-in 'http' module
const http = require('http');

// Define the hostname and port the server will run on
const hostname = '127.0.0.1';
const port = 3000;

// Create the server instance
// The function passed to createServer is called for every HTTP request made to the server
const server = http.createServer((req, res) => {
  // Set the HTTP status code to 200 (OK)
  res.statusCode = 200;
  
  // Set the Content-Type header to indicate a plain text response
  res.setHeader('Content-Type', 'text/plain');
  
  // End the response, sending "Hello, World!" to the client
  res.end('Hello, World!\n');
});

// Start the server and have it listen for connections on the specified port and hostname
server.listen(port, hostname, () => {
  // Log a message to the console once the server is running
  console.log(`Server running at http://${hostname}:${port}/`);
});