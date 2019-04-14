const http = require('http');

const port = 3000;
const hostname = '0.0.0.0';

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello from Application \n' + process.env.VERSION);
});

server.listen(port, hostname, () => {
  console.log(`Server is running on port ${port}.`);
});