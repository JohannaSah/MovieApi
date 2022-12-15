
// declaring the needed constants for all the modules
// a shortcut:
const url = require('url'),
    fs =  require('fs'),
    http = require('http'),
    path = require('path');

// install debugging (node)
debugger;


//importing URL module

// now at top // constant variable that imports the url module, allows the use of function from the momdule
// const url = require('url');

// variable addr : string assigned = static URL adress (could also be non static, by using request.url instead)
let addr = 'http://localhost:8080/default.html?year=2017&month=february';

// variable q : assigned parse(), accessed through the url module via dot notation
// 2 arguments in parse(): addr = is the URL & true ==> does the parsing
let q = url.parse(addr, true);

// to visualize what had been parsed use console.log
console.log(q.host); // returns 'localhost:8080'
console.log(q.pathname); // returns '/default.html'
console.log(q.search); // returns '?year=2017&month=february'

// to use the data another variable is needed
// query() of the q variable is assigned using dot notation
// query() returns the formatted object included in the URL in the form of a string
let qdata = q.query; // returns an object: { year: 2017, month: 'february' }

// console.log part of the data (month) to show access to data
console.log(qdata.month); // returns febuary


// importing fs module

// now at top  // constant variable that imports the fs module
// const fs = require("fs");

// creating the first server

// now at top // constant variable that imports the http module, allows the use of function from the module
// const http = require('http');

// request handler: function is called everytime an HHTP request is made against the server
// createServer is a function from the http module
// request and response are the variables used in the createServer()
http.createServer((request, response) => {
    //declare variables addr, q and filepath
    let addr = request.url,
        q = url.parse(addr, true),
        filePath = '';

    // create a log of requests to server in log.txt
    // use the \n character within a string to quickly and easily create a line break within that string
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Added to log.');
        }
    })

    // piecing together the filepath
    if (q.pathname.includes('documentation')) {
        filePath = path.join(__dirname, '..', '/documentation.html');
    }
    else {
        filePath = 'index.html';
    }


    fs.readFile(filePath, (err, data) => {
        if (err){
            throw err;
        }
    // response is to write a header 
    response.writeHead(200, {'Content-Type': 'text/html'}); 
    // repsone to write the data in the file
    response.write(data);
    // response is empty to allow for the contents of files to be displayed
    response.end();
    // server set to listen for request on port 8080 (standard port for http)
    })

    

console.log('My first Node test server is running on Port 8080.');

