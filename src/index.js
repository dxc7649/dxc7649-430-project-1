// 1 - pull in the HTTP server module
const http = require('http');

// 2 - pull in URL and query modules (for URL parsing)
const url = require('url');
const query = require('querystring');

const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./responses.js');

// 3 - locally this will be 3000, on Heroku it will be assigned
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// 4 - General function for "POST" method
const postMethod = (request, response, parsedUrl, jsonResponse) => {
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
        const generalString = Buffer.concat(body).toString();
        const generalParams = query.parse(generalString);

        jsonResponse(request, response, generalParams);
    });
};

// 5 - Handle both "POST" endpoints: addTask and addUsers
const handlePost = (request, response, parsedUrl) => {
    if (parsedUrl.pathname === '/addTask') {
        postMethod(request, response, parsedUrl, jsonHandler.addTask);    
    } else if (parsedUrl.pathname === '/addUsers') {
        postMethod(request, response, parsedUrl, jsonHandler.addUsers);
    }
};

// 6 - Handle all nine "GET" endpoints
const handleGet = (request, response, parsedUrl, acceptedTypes, params) => {
    if (parsedUrl.pathname === '/style.css') { // 6a - "GET" endpoint for style.css
        htmlHandler.getCSS(request, response, acceptedTypes, request.method, params);
    } else if (parsedUrl.pathname === '/getTasks') { // 6b - "GET" endpoint for /getTasks
        jsonHandler.getTasks(request, response, acceptedTypes, request.method, params);
    } else if (parsedUrl.pathname === '/getUsers') { // 6c - "GET" endpoint for /getUsers
        jsonHandler.getUsers(request, response, acceptedTypes, request.method, params);
    } else if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/welcome.html') { // 6d - "GET" endpoint for home page and /welcome.html
        htmlHandler.getWelcomeResponse(request, response, acceptedTypes, request.method, params);
    } else if (parsedUrl.pathname === '/users.html') { // 6e - "GET" endpoint for /users.html
        htmlHandler.getUsersResponse(request, response, acceptedTypes, request.method, params);
    } else if (parsedUrl.pathname === '/task.html') { // 6f - "GET" endpoint for /task.html
        htmlHandler.getMainResponse(request, response, acceptedTypes, request.method, params);
    } else if (parsedUrl.pathname === '/admin.html') { // 6g - "GET" endpoint for /admin.html
        htmlHandler.getAdminResponse(request, response, acceptedTypes, request.method, params);
    } else if (parsedUrl.pathname === '/list.png') { // 6h - "GET" endpoint for the image
        jsonHandler.getImage(request, response, acceptedTypes, request.method, params);
    } else { // // 6i - Error page
        htmlHandler.getErrorResponse(request, response);
    }
};

// 7 - Handle  two endpoints for "HEAD" method, withe passed in URL, the content type, and the a parameter
const handleHead = (request, response, parsedUrl, acceptedTypes, params) => {
    if (parsedUrl.pathname === '/getTasks') {
        jsonHandler.getTasks(request, response, acceptedTypes, request.method, params);
    } else if (parsedUrl.pathname === '/getUsers') {
        jsonHandler.getUsers(request, response, acceptedTypes, request.method, params);
    }
};

const onRequest = (request, response) => {
    // 8 - Below two lines are from phase 3 of "random-jokes-plus". They will get the contents of 
    // request.headers.accept (a string), then "split" it into an array of strings, and assign this array 
    // to the acceptedTypes variable if acceptedTypes is null or undefined, then assign an empty array to it 
    let acceptedTypes = request.headers.accept.split(',');
    acceptedTypes = acceptedTypes || [];

    const parsedUrl = url.parse(request.url);

    const params = query.parse(parsedUrl.query);
    const {
        limit,
    } = params;

    // 9 - Check for which method is being required
    if (request.method === 'POST') {
        handlePost(request, response, parsedUrl);
    } else if (request.method === 'GET') {
        handleGet(request, response, parsedUrl, acceptedTypes, params);
    } else if (request.method === 'HEAD') {
        handleHead(request, response, parsedUrl, acceptedTypes, params);
    }
};

// 9 - Listening to the assigned port 
http.createServer(onRequest).listen(port); // method chaining!

console.log(`Listening on 127.0.0.1: ${port}`);
