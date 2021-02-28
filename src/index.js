// 1 - pull in the HTTP server module
const http = require('http');

// 2 - pull in URL and query modules (for URL parsing)
const url = require('url');
const query = require('querystring');

const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./responses.js');

// 3 - locally this will be 3000, on Heroku it will be assigned
const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  // Endpoint for default landing page and welcome page
  '/': htmlHandler.getWelcomeResponse,
  '/welcome.html': htmlHandler.getWelcomeResponse,

  // Endpoint for "add task"
  '/task.html': htmlHandler.getMainResponse,

  // Endpoint for "get users" and "get tasks"
  '/getUsers': jsonHandler.getUsers,
  '/getTasks': jsonHandler.getTasks,

  // Endpoint for "add users"
  '/users.html': htmlHandler.getUsersResponse,

  // Endpoint for admin page
  '/admin.html': htmlHandler.getAdminResponse,

  // Endpoint for CSS
  '/style.css': htmlHandler.getCSS,

  // Endpoint for 404 Page
  notFound: htmlHandler.getErrorResponse,
};

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

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  const {
    pathname,
  } = parsedUrl;

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  }

  if (urlStruct[pathname]) {
    urlStruct[pathname](request, response);
  } else {
    urlStruct.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port); // method chaining!

console.log(`Listening on 127.0.0.1: ${port}`);
