const fs = require('fs');

const welcomePage = fs.readFileSync(`${__dirname}/../client/welcome.html`);
const mainPage = fs.readFileSync(`${__dirname}/../client/task.html`);
const userPage = fs.readFileSync(`${__dirname}/../client/users.html`);
const adminPage = fs.readFileSync(`${__dirname}/../client/admin.html`);

const cssPage = fs.readFileSync(`${__dirname}/../client/style.css`);
const errorPage = fs.readFileSync(`${__dirname}/../client/error.html`);

const getWelcomeResponse = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html',
  });
  response.write(welcomePage);
  response.end();
};

const getMainResponse = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html',
  });
  response.write(mainPage);
  response.end();
};

const getUsersResponse = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html',
  });
  response.write(userPage);
  response.end();
};

const getAdminResponse = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html',
  });
  response.write(adminPage);
  response.end();
};

const getErrorResponse = (request, response) => {
  response.writeHead(404, {
    'Content-Type': 'text/html',
  });
  response.write(errorPage);
  response.end();
};

const getCSS = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/css',
  });
  response.write(cssPage);
  response.end();
};

module.exports.getMainResponse = getMainResponse;
module.exports.getWelcomeResponse = getWelcomeResponse;
module.exports.getUsersResponse = getUsersResponse;
module.exports.getAdminResponse = getAdminResponse;
module.exports.getCSS = getCSS;
module.exports.getErrorResponse = getErrorResponse;
