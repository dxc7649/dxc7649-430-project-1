// 1 - Pull in the file system module
const fs = require('fs');

// 2 - Read and pull in six html pages from the "client" folder
const welcomePage = fs.readFileSync(`${__dirname}/../client/welcome.html`);
const mainPage = fs.readFileSync(`${__dirname}/../client/task.html`);
const userPage = fs.readFileSync(`${__dirname}/../client/users.html`);
const adminPage = fs.readFileSync(`${__dirname}/../client/admin.html`);
const cssPage = fs.readFileSync(`${__dirname}/../client/style.css`);
const errorPage = fs.readFileSync(`${__dirname}/../client/error.html`);

// 3 - General reuseable function for multiple responses
const generalResponse = (request, response, contentType, loadPage) => {
    response.writeHead(200, {
        'Content-Type': contentType,
    });
    response.write(loadPage);
    response.end();
}

// 4 - Response for "welcome.html" 
const getWelcomeResponse = (request, response) => generalResponse(request, response, 'text/html', welcomePage);

// 5 - Response for "task.html" 
const getMainResponse = (request, response) => generalResponse(request, response, 'text/html', mainPage);

// 6 - Response for "users.html" 
const getUsersResponse = (request, response) => generalResponse(request, response, 'text/html', userPage);

// 7 - Response for "admin.html" 
const getAdminResponse = (request, response) => generalResponse(request, response, 'text/html', adminPage);

// 8 - Response for "error.html" 
const getErrorResponse = (request, response) => generalResponse(request, response, 'text/html', errorPage);

// 9 - Response for stylesheet "style.css" 
const getCSS = (request, response) => generalResponse(request, response, 'text/css', cssPage);

// 10 - Exports all these responses 
module.exports = {
    getMainResponse,
    getWelcomeResponse,
    getUsersResponse,
    getAdminResponse,
    getCSS,
    getErrorResponse,
};
