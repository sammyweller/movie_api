// creating our own web server

const http = require('http');
    fs = require('fs'), //parses url from user
    url = require('url'); //returns appropriate file as response

http.createServer((request, response) => {
    let addr = request.url, //grabs URL straight from the request
    q = url.parse(addr, true), //store parsed url from user as q
    filePath = ''; //where you store path of the file


    //log of recent requests made to the server:
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    });

    /* below--returns whether or not variable includes value/string
    --in this case, does q(url) contain "documentation"?
    If it does, it pieces together __dirname and “/documentation.html”, 
    adding them as a complete path name to the currently empty filePath
    variable already declared.*/

    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html'; //returns this so they don't exit server
    }

    //below--grabs file from the server & sends to user
    fs.readFile(filePath, (err, data) => { //--(error object, contents of file)
        if (err) {
            throw err; //stops execution of function
        }


    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(data);
    response.end();

    });
}).listen(8080); //port number you want the server to listen on 

console.log('My first Node test server is running on Port 8080.');


