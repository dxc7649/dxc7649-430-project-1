// const _ = require('underscore');
const multiTasks = {};

const multiUsers = {};

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, {
    'Content-Type': 'application/json',
  });
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, {
    'Content-Type': 'application/json',
  });
  response.end();
};

const getTasks = (request, response) => {
  const responseJSON = {
    multiTasks,
  };

  respondJSON(request, response, 200, responseJSON);
};

const getUsers = (request, response) => {
  const responseJSON = {
    multiUsers,
  };

  respondJSON(request, response, 200, responseJSON);
};

const addTask = (request, response, body) => {
  const responseJSON = {
    message: 'Required all three fields: username, task, and time! Plase try again!',
  };

  if (!body.tasks || !body.times || !body.users) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (multiTasks[body.tasks]) {
    responseCode = 204;
  } else {
    multiTasks[body.tasks] = {};
  }

  multiTasks[body.tasks].users = body.users;
  multiTasks[body.tasks].tasks = body.tasks;
  multiTasks[body.tasks].times = body.times;

  if (responseCode === 201) {
    responseJSON.message = 'Task is added!';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

const addUsers = (request, response, body) => {
  const responseJSON = {
    message: 'Required a username! Plase try again',
  };

  if (!body.users) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (multiUsers[body.users]) {
    responseCode = 204;
  } else {
    multiUsers[body.users] = {};
  }

  multiUsers[body.users].users = body.users;

  if (responseCode === 201) {
    responseJSON.message = 'New User is added!';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

module.exports.getTasks = getTasks;
module.exports.addTask = addTask;
module.exports.getUsers = getUsers;
module.exports.addUsers = addUsers;
