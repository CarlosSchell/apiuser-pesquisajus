const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('./../models/userModel.js')
const AppError = require('./../utils/appError.js')
const signToken = require('./../utils/signToken.js')
const verifyToken = require('./../utils/verifyToken.js')
// const sendMail  = require('./../utils/sendMail.js')
const { CLIENT_RENEG_LIMIT } = require('tls')

const getProcessos = asyncHandler(async (req, res, next) => {

  const email = req.email
  // const role = req.role

  console.log('Dentro do getProcessos : Email', email )

  const user = await User.findOne({ email })
  if (!user) {
    return next(new AppError('Usuário não encontrado !', 401))
  }

  // console.log('Dentro do getProcessos : user', user )

  res.status(201).json({
    status: 'success',
    user: {
      email: user.email,
      processos: user.processos,
    },
  })

})

const gravaProcessos = asyncHandler(async (req, res, next) => {
  //console.log(req)
  const processos = req.body.processos
  console.log('Processos : ',processos)
  const { email, role } = req
  console.log('Email : ', email)

  const data = await User.findOneAndUpdate(
    { email },
    { processos},
    { new: true }
  )

  if (!data) {
    return next(new AppError('Usuário não encontrado!', 400))
  }

  res.status(201).json({
    status: 'success',
    email,
    processos
  })
})

module.exports = {
  getProcessos,
  gravaProcessos,
}
