const mongoose = require('mongoose')
const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const compression = require('compression')
const cors = require('cors')
const AppError = require('./utils/appError.js')
const globalErrorHandler = require('./controllers/errorController.js')
const userRouter = require('./routes/userRoutes.js')

// import mongoose from 'mongoose'
// import express from 'express'
// import dotenv from 'dotenv'
// import path from 'path'
// import morgan from 'morgan'
// import rateLimit from 'express-rate-limit'
// import helmet from 'helmet'
// import mongoSanitize from 'express-mongo-sanitize'
// import xss from 'xss-clean'
// import hpp from 'hpp'
// import cookieParser from 'cookie-parser'
// import bodyParser from 'body-parser'
// import compression from 'compression'
// import cors from 'cors'
// import AppError from './utils/appError.js'
// import globalErrorHandler from './controllers/errorController.js'
// import userRouter from './routes/userRoutes.js'

// Start express app
const app = express()

app.enable('trust proxy')

// const __dirname = path.resolve()

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors())
// Access-Control-Allow-Origin *

// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

app.options('*', cors())
// app.options('/api/v1/tours/:id', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))

// Set security HTTP headers
app.use(helmet())

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
})
app.use('/api', limiter)

// // Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
// app.post(
//   '/webhook-checkout',
//   bodyParser.raw({ type: 'application/json' }),
//   bookingController.webhookCheckout
// );

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: [
//       'duration',
//       'ratingsQuantity',
//       'ratingsAverage',
//       'maxGroupSize',
//       'difficulty',
//       'price'
//     ]
//   })
// );

app.use(compression())

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  // console.log(req.cookies);
  next()
})

// 3) ROUTES
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Erro no servidor - 404 - Url ${req.originalUrl} não encontrada`,
      404
    )
  )
})

app.use(globalErrorHandler)

module.exports = app
