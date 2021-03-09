// 1 - Pull in the file system module
const fs = require('fs');
// 2 - Pull in the "path" module
const path = require('path');

const multiTasks = [];

const multiUsers = [];

// 3 - Borrowed code to calculate the size of content-length 
// Source: https://stackoverflow.com/questions/2219526/how-many-bytes-in-a-javascript-string/29955838
// Refactored to an arrow function by ACJ
const getBinarySize = (string) => Buffer.byteLength(string, 'utf8');

// 4 - Borrowed from :stream-media-assignment" to load an image 
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

        // 4a- remove the part "bytes=" then split the number with '-'
        const positions = range.replace(/bytes=/, '').split('-');

        // 4b - Parse the first part ['0000', '0001'](the start) into integer
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

// 5 - "Get" endpoint for image
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

// 6 - Response for "getTasks" endpoint
const getTasks = (request, response, acceptedTypes, httpmethod) => {
    // 6a - Check whether the content type is 'text/xml' or 'application/json', and 
    // whether the request method is "HEAD" or "GET" 
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

// 7 - Parameter function for "getUsers", which return a new array with limited number of users
const getUserJSON = (limit = multiUsers.length) => {
    let limit2 = Number(limit);
    const usersLength = multiUsers.length;

    // 7a -  Check for the "limit" that is passed in, see if it is an integer, bigger than 1, and 
    // smaller than the length of the array "multiUsres"
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

// 8 - Respones for "getUsers" endpoint
const getUsers = (request, response, acceptedTyeps, httpmethod, params) => {
    // 8a - Check whether the content type is 'text/xml' or 'application/json', and 
    // whether the request method is "HEAD" or "GET" 
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

// 9 - Function for adding tasks to To-do list
const addTask = (request, response, body) => {
    const responseJSON = {
        message: 'Required all three fields: username, task, and time! Plase try again!',
    };

    if (!body.tasks || !body.times || !body.users) {
        responseJSON.id = 'missingParams';
        return respondJSON(request, response, 400, responseJSON);
    }

    let responseCode = 201;

    // 9a - Check to see if there is a object inside the array with the same username and the same task
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

// 10 - Function for adding new users
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

module.exports = {
    getTasks,
    addTask,
    getUsers,
    addUsers,
    getImage,
}
