const http = require('http')
const path = require('path')
const fs = require('fs')

const config = require('../src/config.json')

function allowCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers')
}

http.createServer((req, res) => {
  const { url } = req
  console.log(url)
  if (!url.endsWith('.json')) {
    res.writeHead(404)
    res.end()
    return
  }
  try {
    allowCors(res)
    fs.createReadStream(path.join(__dirname, url), 'utf8').pipe(res)
  } catch (err) {
    console.error(err)
    res.statusCode(404).send('incorrect endpoint')
  }
}).listen(config.server.port)

console.log('server started')
