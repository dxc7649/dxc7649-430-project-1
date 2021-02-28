// 1 - pull in the HTTP server module
const http = require('http');

// 2 - pull in URL and query modules (for URL parsing)
const url = require('url');
const query = require('querystring');

const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./responses.js');

// 3 - locally this will be 3000, on Heroku it will be assigned
const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addTask') {
    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const tasksString = Buffer.concat(body).toString();
      const tasksParams = query.parse(tasksString);

      jsonHandler.addTask(request, response, tasksParams);
    });
  } else if (parsedUrl.pathname === '/addUsers') {
    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const usersString = Buffer.concat(body).toString();
      const usersParams = query.parse(usersString);

      jsonHandler.addUsers(request, response, usersParams);
    });
  }
};

const handleGet = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getTasks') {
    jsonHandler.getTasks(request, response);
  } else if (parsedUrl.pathname === '/getUsers') {
    jsonHandler.getUsers(request, response);
  } else if (parsedUrl.pathname === '/') {
    htmlHandler.getWelcomeResponse(request, response);
  } else if (parsedUrl.pathname === '/users.html') {
    htmlHandler.getUsersResponse(request, response);
  } else if (parsedUrl.pathname === '/admin.html') {
    htmlHandler.getAdminResponse(request, response);
  } else {
    htmlHandler.getMainResponse(request, response);
  }
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else if (request.method === 'GET') {
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port); // method chaining!

console.log(`Listening on 127.0.0.1: ${port}`);