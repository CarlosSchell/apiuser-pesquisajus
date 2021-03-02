const mongoose = require('mongoose')
const dotenv = require('dotenv')
const https = require ('https')
const fs = require ('fs')

// process.on('uncaughtException', (err) => {
//   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
//   console.log(err.name, err.message)
//   process.exit(1)
// })

dotenv.config()

// const app_host = process.env.APP_HOST
// console.log('Domínio do Servidor : ', app_host)

const app = require('./app.js')

const DB = 'mongodb://api-pesquisaju01:api-pesquisaju01-mongodb@mongodb.api-pesquisajus.com.br:27017/api-pesquisaju01'

// process.env.DATABASE

// .replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// )

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful! : ', DB))

const port = process.env.PORT || 3000

https.createServer({
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.cert')
}, app)
.listen(port, function () {
  console.log(`App running on port ${port}...`)
})

// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`)
// })

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully')
  server.close(() => {
    console.log('💥 Process terminated!')
  })
})
