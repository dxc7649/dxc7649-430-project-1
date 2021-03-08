const multiTasks = [];

const multiUsers = {};

const getBinarySize = (string) => Buffer.byteLength(string, 'utf8');

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

const respondMeta = (request, response, type, byteLength) => {
  const headers = {
    'Content-Type': type,
    'Content-Length': byteLength,
  };

  response.writeHead(200, headers);
  response.end();
};

/*
const getTasks = (request, response) => {
  const responseJSON = {
    multiTasks,
  };

  respondJSON(request, response, 200, responseJSON);
};

*/

const getTasks = (request, response, acceptedTypes) => {
  if (acceptedTypes.includes('text/xml') === true) {
    const taskXML = multiTasks;

    response.writeHead(200, {
      'Content-Type': 'text/xml',
    });

    response.write('<multiTasks>');
    for (let i = 0; i < taskXML.length; i += 1) {
      response.write(`
                <multiTask>
                    <user>${taskXML[i].user}</user>
                    <task>${taskXML[i].task}</task>
                    <time>${taskXML[i].time}</time>
                </multiTask>
            `);
    }
    response.write('</multiTasks>');

    response.end();
  } else {
    const taskString = JSON.stringify(multiTasks);
    response.writeHead(200, {
      'Content-Type': 'application/json',
    });
    response.write(taskString);
    response.end();

    const taskJSON = JSON.stringify(multiTasks);

    return respondMeta(request, response, 'application/json', getBinarySize(taskJSON));
  }

  const taskString = JSON.stringify(multiTasks);

  return respondMeta(request, response, 'application/json', getBinarySize(taskString));
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

  if (multiTasks.find((element) => element.task === body.tasks)
        && multiTasks.find((element) => element.user === body.users)) {
    responseCode = 204;

    for (let i = 0; i < multiTasks.length; i += 1) {
      if (multiTasks[i].task === body.tasks && multiTasks[i].user === body.users) {
        multiTasks[i].time = body.times;
        break;
      }
    }
  } else {
    const newUser = {};
    newUser.user = body.users;
    newUser.task = body.tasks;
    newUser.time = body.times;

    multiTasks.push(newUser);
  }

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
