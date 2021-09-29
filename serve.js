const http = require('http')
const path = require('path');
const fs = require('fs')

let portNumber = 80

var app = function (req, res)
{
  if (req.method == 'HEAD')
  {
    console.log('Received: Head');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end();
  }
  else if (req.method == 'GET')
  {
    console.log(`GET req=${req.url}`);

    const pathname = '.' + (req.url === '/') ? '/index.html' : req.url;
    const ext = path.parse(pathname).ext;
    const map = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword'
    };
    mime = map[ext] || 'text/plain';

    fs.readFile(pathname, (err, data) =>
    {
      if (err)
      {
        console.error(`(GET) not found: ${pathname}`);
        res.writeHead(404);
        res.end();
      }
      else
      {
        console.error(`(GET) retrieve ${pathname}`);
        res.writeHead(200, {'Content-Type': `${mime}`});
        res.write(data);
        res.end();
      }
    });
  }
  else if (req.method == 'POST')
  {
    //console.log(`POST req=${req.url}`);

    let pathname = '.' + req.url;

    fs.access(pathname, fs.F_OK, (err) =>
    {
      if (err)
      {
        console.log(`(POST) not found: ${pathname}`);
        res.writeHead(404);
        res.end();
      }
      else
      {
        console.log(`(POST) found: ${pathname}`);
        res.writeHead(200);
        res.end();
      }
    });
  }
  else
  {
    console.log(`Unexpected request: ${req.method}`);
    res.writeHead(405);
    res.end();
  }
}

http.createServer(app).listen(portNumber, ()=>
  {
    console.log('Server running...');
  });
