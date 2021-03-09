const fs = require('fs'); // pull in the file system module
const path = require('path'); // pull in the "path" module

const multiTasks = [];

const multiUsers = [];

const getBinarySize = (string) => Buffer.byteLength(string, 'utf8');

const loadFile = (request, response, filePath, fileType) => {
    const file = path.resolve(__dirname, filePath);

    fs.stat(file, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                response.writeHead(404);
            }
            return response.end(err);
        }

        let {
            range,
        } = request.headers;

        if (!range) {
            range = 'bytes=0-';
        }

        // remove the part "bytes=" then split the number with '-'
        const positions = range.replace(/bytes=/, '').split('-');

        // Parse the first part ['0000', '0001'](the start) into integer
        let start = parseInt(positions[0], 10);

        const total = stats.size;
        const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

        if (start > end) {
            start = end - 1;
        }

        const chunksize = (end - start) + 1;

        response.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': fileType,
        });

        const stream = fs.createReadStream(file, {
            start,
            end,
        });

        stream.on('open', () => {
            stream.pipe(response);
        });

        stream.on('error', (streamErr) => {
            response.end(streamErr);
        });

        return stream;
    });
};

const getImage = (request, response) => {
    loadFile(request, response, '../client/list.png', 'image/png');
};

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

// Response for "getTasks" endpoint 
const getTasks = (request, response, acceptedTypes, httpmethod, params) => {
    if (acceptedTypes.includes('text/xml') === true && httpmethod === 'GET') {
        const taskXML = multiTasks;

        response.writeHead(200, {
            'Content-Type': 'text/xml',
        });

        response.write('<Tasks>');
        for (let i = 0; i < taskXML.length; i += 1) {
            response.write(`
                <Task>
                    <user>${taskXML[i].user}</user>
                    <task>${taskXML[i].task}</task>
                    <time>${taskXML[i].time}</time>
                </Task>
            `);
        }
        response.write('</Tasks>');

        response.end();
    } else if (acceptedTypes.includes('text/xml') === true && httpmethod === 'HEAD') {
        const taskXML = multiTasks;
        let byteSize = 0;

        for (let i = 0; i < taskXML.length; i += 1) {
            const byteXML = `
                <Task>
                    <user>${taskXML[i].user}</user>
                    <task>${taskXML[i].task}</task>
                    <time>${taskXML[i].time}</time>
                </Task>
            `;

            byteSize += getBinarySize(byteXML);
        }

        return respondMeta(request, response, 'text/xml', byteSize);
    } else if (httpmethod === 'GET') {
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

// Parameter function for "getUsers"
const getUserJSON = (limit = multiUsers.length) => {
    let limit2 = Number(limit);
    const usersLength = multiUsers.length;

    limit2 = !limit2 ? 1 : limit;
    limit2 = limit2 < 1 ? 1 : limit2;
    limit2 = limit2 > usersLength ? usersLength - 1 : limit2;
    
    const userKeys = [...multiUsers.keys()];
    
    const sliceKeys = userKeys.slice(0, limit2);
    
    const limitUser = [];
    sliceKeys.forEach((keys) => {
        limitUser.push(multiUsers[keys]);
    });
    
    return limitUser;
};

// Respones for "getUsers" endpoint
const getUsers = (request, response, acceptedTyeps, httpmethod, params) => {
    if (acceptedTyeps.includes('text/xml') === true && httpmethod === 'GET') {
        const userXML = getUserJSON(params.limit);

        response.writeHead(200, {
            'Content-Type': 'text/xml',
        });

        response.write('<Usernames>');
        for (let i = 0; i < userXML.length; i += 1) {
            response.write(`
                <Username>
                    <user>${userXML[i]}</user>
                </Username>
            `);
        }
        response.write('</Usernames>');

        response.end();
    } else if (acceptedTyeps.includes('text/xml') === true && httpmethod === 'HEAD') {
        const userXML = getUserJSON(params.limit);
        let byteSize = 0;

        for (let i = 0; i < userXML.length; i += 1) {
            const byteXML = `
                <Username>
                    <user>${userXML[i]}</user>
                </Username>
            `;

            byteSize += getBinarySize(byteXML);
        }

        return respondMeta(request, response, 'text/xml', byteSize);
    } else if (httpmethod === 'GET') {
        const userString = JSON.stringify(getUserJSON(params.limit));
        response.writeHead(200, {
            'Content-Type': 'application/json',
        });
        response.write(userString);
        response.end();

        const userJSON = JSON.stringify(getUserJSON(params.limit));

        return respondMeta(request, response, 'application/json', getBinarySize(userJSON));
    }

    const userString = JSON.stringify(getUserJSON(params.limit));

    return respondMeta(request, response, 'application/json', getBinarySize(userString));
};

// Function for adding tasks to To-do list
const addTask = (request, response, body) => {
    const responseJSON = {
        message: 'Required all three fields: username, task, and time! Plase try again!',
    };

    if (!body.tasks || !body.times || !body.users) {
        responseJSON.id = 'missingParams';
        return respondJSON(request, response, 400, responseJSON);
    }

    let responseCode = 201;

    if (multiTasks.find((element) => element.task === body.tasks) &&
        multiTasks.find((element) => element.user === body.users)) {
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

// Function for adding new users
const addUsers = (request, response, body) => {
    const responseJSON = {
        message: 'Required a username! Plase try again',
    };

    if (!body.users) {
        responseJSON.id = 'missingParams';
        return respondJSON(request, response, 400, responseJSON);
    }

    let responseCode = 201;

    if (multiUsers.find((element) => element === body.users)) {
        responseCode = 204;
    } else {
        multiUsers.push(body.users);
    }

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
module.exports.getImage = getImage;