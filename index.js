const http = require('http');
const https = require('https');
const fs = require('fs').promises;

async function getData(url)
{
	return new Promise((resolve,reject) => 
	{
		let data = [];
		let request = https.get(
			url,
			(res) => 
			{
				res.on('data', (buffer) => 
				{
					data.push(buffer);
				});
				res.on('end', () => 
				{
					resolve(Buffer.concat(data));
				});
			}
		);
		request.on('error',(err)=>
		{
			reject(err);
		});
	});
}

async function getFile(path) 
{

	return   await fs.readFile(`./website${path}`).catch((err) => 
	{
		throw new Error(err);
	});
  
}

const server = http.createServer(async (req, res) => 
{
	if (req.url.length == 1) 
	{
		res.write(await getFile('/mainPage.html'));

	}
	else if(req.url.startsWith('/resources'))
	{
		let itemId = req.url.slice(req.url.lastIndexOf('/',req.url.length));
		let item = await getData(`https://www.simcompanies.com/api/v3/tr/encyclopedia/resources/1${itemId}/`).catch(()=>
		{
			res.statusCode = 404;
		});
		if(item)
		{
			res.setHeader('Content-Type', 'application/json');
			res.write(item);    
		}
	}
	else 
	{
		let file = await getFile(req.url).catch(async () => 
		{
			res.statusCode = 404;
		});
		if (file) 
		{
			if (req.url.slice(req.url.lastIndexOf('.'), req.url.length--) == '.js') 
			{
				res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			}
			else if (req.url.slice(req.url.lastIndexOf('.'), req.url.length--) == '.css') 
			{
				res.setHeader('Content-Type', 'text/css; charset=utf-8');
			}
      
			res.write(file);
		}
	}

	res.end();
});

server.on('clientError', (err, socket) => 
{
	socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(80);
