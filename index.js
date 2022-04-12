const http = require("http");
const https = require("https");
const fs = require("fs").promises;
const ejs = require("ejs");

function getItems() {
  return new Promise((resolve, reject) => {
    let data = [];
    https.get(
      "https://www.simcompanies.com/api/v3/tr/encyclopedia/resources/",
      (res) => {
        res.on("data", (buffer) => {
          data.push(buffer);
        });
        res.on("end", () => {
          data = JSON.parse(Buffer.concat(data));
          resolve(data);
        });
      }
    );
  });
}

async function getFile(path) {
  let data;
  if (path.slice(path.lastIndexOf("."), path.length--) == ".ejs") {
    if (path == "/mainPage.ejs") {
      items = await getItems();
      items.map((item) => {
        item.image =
          "https://d1fxy698ilbz6u.cloudfront.net/static/" + item.image;
      });
      content = await ejs.renderFile("./website/mainPage.ejs", {
        items: items,
      });
      data = content;
    }
  } else {
    data = await fs.readFile(`./website${path}`).catch((err) => {
      throw Error(err);
    });
  }
  return data;
}

const server = http.createServer(async (req, res) => {
  if (req.url.length == 1) {
    res.write(await getFile("/mainPage.ejs"));
  } else {
    let file = await getFile(req.url).catch(async (err) => {
      res.statusCode = 404;
    });
    if (file) {
      if (req.url.slice(req.url.lastIndexOf("."), req.url.length--) == ".js") {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      } else if (
        req.url.slice(req.url.lastIndexOf("."), req.url.length--) == ".css"
      ) {
        res.setHeader("Content-Type", "text/css; charset=utf-8");
      }
      res.write(file);
    }
  }

  res.end();
});

server.on("clientError", (err, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});
server.listen(80);
