const asyncHandler = require('express-async-handler')
const User = require('./../models/userModel.js')
const AppError = require('./../utils/appError.js')
const verifyToken = require('./../utils/verifyToken.js')

// const getProcessos = asyncHandler(async (req, res, next) => {

//   const email = req.email
//   // const role = req.role

//   console.log('Dentro do getProcessos : Email', email )

//   const user = await User.findOne({ email })
//   if (!user) {
//     return next(new AppError('Usuário não encontrado !', 401))
//   }

//   // console.log('Dentro do getProcessos : user', user )

//   res.status(201).json({
//     status: 'success',
//     user: {
//       email: user.email,
//       processos: user.processos,
//     },
//   })

// })

//
const gravaProcessos = asyncHandler(async (req, res, next) => {
  console.log('Entrou no gravaProcessos !')

  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('O token de autorização não válido! Solicite nova confirmação de senha', 401))
  }

  console.log('Token:', token)
  console.log('Body:', req.body)

  const decoded = verifyToken(token, next) //Synchronous

  console.log('Decoded:', decoded)

  const email = decoded.email

  let processos

  if (req.body.processos) {
    processos = req.body.processos
  } else {
    processos = []
  }

  if (!email) {
    return next(new AppError('O email do usuário não foi fornecido!', 400))
  }

  const user = await User.findOneAndUpdate({ email }, { processos }, { new: true })

  // const user = await User.findOne({ email })

  if (!user) {
    return next(new AppError('Usuário não encontrado para este email!', 401))
  }

  res.status(200).json({
    status: 'success',
    message: 'Foram gravados os dados dos processos do usuário !',
    data: {
      email,
      processos,
    },
  })
})

const getProcessos = asyncHandler(async (req, res, next) => {
  console.log('Entrou no getProcessos !')

  console.log('req.headers.authorization !', req.headers.authorization)

  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('O token de autorização não válido! Solicite nova confirmação de senha', 401))
  }

  console.log('Token:', token)
  console.log('Body:', req.body)

  const decoded = verifyToken(token, next) //Synchronous

  console.log('Decoded:', decoded)

  const email = decoded.email

  if (!email) {
    return next(new AppError('O email do usuário não foi fornecido!', 400))
  }

  const user = await User.findOne({ email })

  // const user = await User.findOne({ email })

  if (!user) {
    return next(new AppError('Usuário não encontrado para este email!', 401))
  }

  let processos
  if (user.processos) {
    processos = user.processos
  } else {
    processos = []
  }

  res.status(200).json({
    status: 'success',
    message: 'Foram enviados os dados dos processos do usuário !',
    data: {
      email,
      processos,
    },
  })
})

module.exports = {
  getProcessos,
  gravaProcessos,
}

// const gravaProcessos = asyncHandler(async (req, res, next) => {
//   //console.log(req)
//   const processos = req.body.processos
//   console.log('Processos : ',processos)
//   const { email, role } = req
//   console.log('Email : ', email)

//   const data = await User.findOneAndUpdate(
//     { email },
//     { processos},
//     { new: true }
//   )

//   if (!data) {
//     return next(new AppError('Usuário não encontrado!', 400))
//   }

//   res.status(201).json({
//     status: 'success',
//     email,
//     processos
//   })
// })
