const http = require('http')
const path = require('path')
const fs = require('fs')
const zlib = require('zlib')

const { server: serverConfig } = require('../src/config.json')

http.createServer((req, res) => {
  const { url } = req
  console.log(url)
  if (!url.endsWith('.json')) {
    res.writeHead(404)
    res.end()
    return
  }
  try {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Encoding', 'gzip')
    fs.createReadStream(path.join(__dirname, url), 'utf8')
      .pipe(zlib.createGzip())
      .pipe(res)
  } catch (err) {
    console.error(err)
    res.statusCode(404).send('incorrect endpoint')
  }
}).listen(serverConfig.port, () => {
  console.log('server has started', serverConfig.host, serverConfig.port)
})
