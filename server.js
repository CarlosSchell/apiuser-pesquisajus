import mongoose from 'mongoose'
import dotenv from 'dotenv'

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  process.exit(1)
})

dotenv.config()

import app from './app.js'

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );

const DB =
  '=mongodb+srv://CarlosSchell:Chsmon1962@cluster0.jrlnc.mongodb.net/natours?authSource=admin&replicaSet=atlas-10nsk0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true'

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'))

// import mongoose from 'mongoose'

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       useUnifiedTopology: true,
//       useNewUrlParser: true,
//       useCreateIndex: true,
//       useFindAndModify: true,
//     })

//     console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline)
//   } catch (error) {
//     console.error(`Error: ${error.message}`.red.underline.bold)
//     process.exit(1)
//   }
// }

// export default connectDB

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})

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
