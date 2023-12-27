const http = require('http')
const path = require('path');
const fs = require('fs')

const portNumber  = 80 // HTTP port

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

    const pathname = '.' + ((req.url === '/') ? '/index.html' : req.url);
    fs.readFile(pathname, (err, data) =>
    {
      if (err)
      {
        console.error(`GET not found: ${pathname}`);
        res.writeHead(404);
        res.end();
      }
      else
      {
        console.log(`GET retrieve ${pathname}`);

        const ext = path.parse(pathname).ext;
        const map = {
            '.png': 'image/png',
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            // '.ico': 'image/x-icon',
            // '.jpg': 'image/jpeg',
            // '.wav': 'audio/wav',
            // '.mp3': 'audio/mpeg',
            // '.svg': 'image/svg+xml',
            // '.pdf': 'application/pdf',
            // '.doc': 'application/msword'
            // '.json': 'application/json',
        };
        mime = map[ext] || 'text/plain';

        res.writeHead(200, {'Content-Type': `${mime}`});
        res.write(data);
        res.end();
      }
    });
  }
  // else if (req.method == 'POST')
  // {
  //   //console.log(`POST req=${req.url}`);

  //   let pathname = '.' + req.url;

  //   fs.access(pathname, fs.F_OK, (err) =>
  //   {
  //     if (err)
  //     {
  //       console.log(`POST not found: ${pathname}`);
  //       res.writeHead(404);
  //       res.end();
  //     }
  //     else
  //     {
  //       console.log(`POST found: ${pathname}`);
  //       res.writeHead(200);
  //       res.end();
  //     }
  //   });
  // }
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
