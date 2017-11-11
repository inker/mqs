const http = require('http')
// const path = require('path')
const fs = require('fs')

http.createServer((req, res) => {
  const { url } = req
  console.log(url)
  try {
    fs.createReadStream(url, 'utf8').pipe(res)
  } catch (err) {
    console.error(err)
    res.statusCode(404).send('incorrect endpoint')
  }
})
