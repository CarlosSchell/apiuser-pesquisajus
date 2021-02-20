// const express = require('express');
// const app = express();

const path = require('path')

const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('./../models/userModel.js')
const AppError = require('./../utils/appError.js')
const signToken = require('./../utils/signToken.js')
const verifyToken = require('./../utils/verifyToken.js')
const dotenv = require('dotenv')
const sendEmail = require('../email/sendEmail.js')
// const { htmlToText } = require('html-to-text')
const { CLIENT_RENEG_LIMIT } = require('tls')

dotenv.config()

//
const register = asyncHandler(async (req, res, next) => {
  let { email, name, role } = req.body
  if (!role) {
    role = 'user'
    req.body.role = 'user'
  }

  if (!name) {
    name = email.split('@')[0]
    req.body.name = email.split('@')[0]
  }

  const userExists = await User.findOne({ email })
  if (userExists) {
    return next(new AppError('Email já cadastrado!', 400))
  }

  const tokenConfirm = signToken({ email }, next)

  const user = await User.create({
    name,
    email,
    role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    processos: [],
    isLoggedInUser: false,
    isConfirmedUser: false,
    tokenConfirm,
  })

  if (!user) {
    return next(new AppError('Erro ao gravar o novo usuário', 500))
  }

  // Envia email de confirmação
  //const url = `${req.protocol}://${req.get('host')}api/v1/users/confirm/${email}`
  const url = `${req.protocol}://${req.get('host')}/v1/confirm/${tokenConfirm}`

  const to = user.email
  const from = `Contato <${process.env.EMAIL_USER}>` // 'contato@pesquisajus.com'
  const subject = 'Bem vindo ao pesquisajus! - Por favor confirme o seu email'
  const text = ''

  const htmlConfirmLink = `<div className="text-center py-3">
    <img src="./method-draw-image.svg" alt="pesquisajus logo" width="100" height="200"></img>
    <h2> Olá ${name}!</h2>
    <h2>Bem vindo ao pesquisajus!</h2>
    <p>Clique no link abaixo para podermos${' '}<strong>confirmar seu email!</strong></p>
    <a href="${url}">Confirmar E-mail</a>
    <p>Ou se preferir copie e cole o link abaixo:</p>
    <p>${url}</p>`

  await sendEmail(to, from, subject, text, htmlConfirmLink, url) //.catch(console.error)

  // Definir página html de email confirmado com link para a aplicacao pesquisajus
  user.password = undefined

  res.status(201).json({
    status: 'success',
    message: 'Cadastro bem sucedido! O link para confirmação da conta foi enviado para o seu email',
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
})

//
const confirmUserEmail = asyncHandler(async (req, res, next) => {
  const tokenConfirm = req.params.token
  const decoded = verifyToken(tokenConfirm, next) //Synchronous
  const email = decoded.email
  const user = await User.findOne({ email })

  if (!user) {
    return next(new AppError(`Usuário não encontrado para este email ${email}`, 404))
  }

  if (tokenConfirm !== user.tokenConfirm) {
    return next(
      new AppError(
        'O token de autorização não válido! Entre no login novamente para solicitar novo link de confirmação !',
        404
      )
    )
  }

  user.isConfirmedUser = true
  user.tokenConfirm = ''
  await user.save()

  res.status(200).json({
    status: 'success',
    msg: 'O email do usuário foi confirmado!',
    user: {
      email: user.email,
    },
  })

  // console.log(__dirname)
  // console.log(path.join(__dirname + '\\userconfirmed.html'))
  // res.sendFile(path.join(__dirname + '\\userconfirmed.html'))
})

//
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    return next(new AppError('Por favor entre com o email e a senha!', 400))
  }

  const user = await User.findOne({ email })
  if (!user || !(await user.matchPassword(password, user.password))) {
    return next(new AppError('O email ou a senha estão incorretos !', 401))
  }

  if (!user.role) {
    role = 'user'
  } else {
    role = user.role
  }

  let isConfirmedUser
  if (user.isConfirmedUser === true) {
    isConfirmedUser = user.isConfirmedUser
  } else {
    isConfirmedUser = false
  }

  if (isConfirmedUser === false) {
    return next(new AppError('Voce ainda não confirmou a sua conta!. Verifique a sua caixa de email!', 401))
  }
  const token = signToken({ email, role }, next)

  // console.log('Login user Token : ', token)

  // if (token) {
  //   // Reenvia email de confirmação
  //   const url = `${req.protocol}://${req.get('host')}/v1/confirm/${token}`
  //   console.log('Url do Email: ', url)

  //   const to = user.email
  //   const from = `Contato <${process.env.EMAIL_USER}>` // 'contato@pesquisajus.com'
  //   const subject = 'Bem vindo ao pesquisajus! - Por favor confirme o seu email'
  //   const text = ''
  //   const htmlConfirmLink = `<div className="text-center py-3">
  //     <img src="./method-draw-image.svg" alt="pesquisajus logo" width="100" height="200"></img>
  //     <h2> Olá ${user.name} Estamos reenviando este link para você!</h2>
  //     <h2>Bem vindo ao pesquisajus!</h2>
  //     <p>Clique no link abaixo para podermos${' '}<strong>confirmar seu email!</strong></p>
  //     <a href="${url}">Confirmar E-mail</a>
  //     <p>Ou se preferir copie e cole o link abaixo:</p>
  //     <p>${url}</p>`

  //   await sendEmail(to, from, subject, text, htmlConfirmLink, url)
  // }
  // return next(new AppError('Verifique a sua caixa de email para confirmar sua conta!', 401))

  const data = await User.findOneAndUpdate({ email }, { token, isLoggedIn: true }, { new: true })

  if (!data) {
    return next(new AppError('Erro ao gravar o login do usuário', 500))
  }

  res.status(201).json({
    status: 'success',
    message: 'O login foi bem sucedido !',
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      token: data.token,
    },
  })
})

//
const logout = (req, res) => {
  // res.cookie('jwt', 'loggedout', {
  //   expires: new Date(Date.now() + 10 * 1000),
  //   httpOnly: true,
  // })
  // isLoggedInUser = false
  res.status(200).json({ status: 'success' })

  // acessar user database e setar flags
}

//
const forgotPassword = asyncHandler(async (req, res, next) => {
  const email = req.body.email
  const user = await User.findOne({ email })
  if (!user) {
    return next(new AppError('Não foi encontrado usuário para este endereço de email!', 404))
  }

  // Verify if the User  isConfirmedUser
  if (user.isConfirmedUser !== true) {
    return next(new AppError('O email do usuário não foi confirmado!', 404))
  }

  if (user.isConfirmedUser === true) {
    // 2) Generate the reset token
    const token = signToken({ email }, next)

    // Envia email de confirmação
    //const url = `${req.protocol}://${req.get('host')}api/v1/users/confirm/${email}`
    const url = `${req.protocol}://${req.get('host')}/v1/resetpassword/${token}`

    const to = user.email
    const from = `Contato <${process.env.EMAIL_USER}>` // 'contato@pesquisajus.com'
    const subject = 'Link para mudança de senha - pesquisajus!'
    const text = ''

    const htmlConfirmLink = `<div className="text-center py-3">
      <img src="./method-draw-image.svg" alt="pesquisajus logo" width="100" height="200"></img>
      <h2> Olá usuário <strong>pesquisajus!</strong></h2>
      <h2>Voce solicitou um link para mudar a sua senha!</h2>
      <p>Clique no link abaixo para cadastrar a sua nova senha!</p>
      <a href="${url}">Confirmar E-mail</a>
      <p>Ou se preferir copie e cole o link abaixo:</p>
      <p>${url}</p>`

    await sendEmail(to, from, subject, text, htmlConfirmLink, url) //.catch(console.error)

    res.status(200).json({
      status: 'success',
      message: 'O link para o cadastro de nova senha foi enviado para o email',
    })
  }
})

//
const protect = asyncHandler(async (req, res, next) => {
  // 1) Getting token and check if it's there

  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('Por favor faça login para acessar o sistema.', 401))
  }

  // 2) Read and Verify token
  const decoded = await verifyToken(token, next)
  // console.log(decoded)

  // 3} Put extracted token data in the req (not in the body !!!)
  req.email = decoded.email
  req.role = decoded.role

  console.log('Token decoded data : ', decoded)
  console.log('Inside protect : req.email : ', req.email)
  console.log('Inside protect : req.role  : ', req.role)
  //console.log(req.role)

  // // 3) Check if user still exists
  // const currentUser = await User.findOne(decoded.email)
  // if (!currentUser) {
  //   return next(
  //     new AppError(
  //       'The user belonging to this token does no longer exist.',
  //       401
  //     )
  //   )
  // }

  // 4) Check if user changed password after the token was issued
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError('User recently changed password! Please log in again.', 401)
  //   )
  // }

  // GRANT ACCESS TO PROTECTED ROUTE
  // req.user = currentUser
  // res.locals.user = currentUser
  next()
})

// Only for rendered pages, no errors!
// const isLoggedIn = async (req, res, next) => {
//   if (req.cookies.jwt) {
//     try {
//       // 1) verify token
//       const decoded = await promisify(jwt.verify)(
//         req.cookies.jwt,
//         process.env.JWT_SECRET
//       )

//       // 2) Check if user still exists
//       const currentUser = await User.findById(decoded.id)
//       if (!currentUser) {
//         return next()
//       }

//       // 3) Check if user changed password after the token was issued
//       if (currentUser.changedPasswordAfter(decoded.iat)) {
//         return next()
//       }

//       // THERE IS A LOGGED IN USER
//       res.locals.user = currentUser
//       return next()
//     } catch (err) {
//       return next()
//     }
//   }
//   next()
// }

const restrictTo = (roles) => {
  console.log(roles)

  return (req, res, next) => {
    // roles ['admin', 'master']
    //console.log(req.role)

    if (!roles.includes(req.role)) {
      // console.log((roles.includes(req.role)))

      return next(new AppError('You do not have permission to perform this action', 403))

      // Alternative Error Handling
      // res.status(403).json({
      //   status: 'fail',
      //   message: 'Voce não tem permissão para fazer esta operação',
      //   role: req.role
      // })
    }

    next()
  }
}

//
const updatePassword = asyncHandler(async (req, res, next) => {
  console.log('Entrou no updatePassword !')

  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('Não foi enviado o token de autorização.', 401))
  }

  // const token = req.params.token   --> no caso de forgot password / o link vem por email / com token na url

  console.log('Token : ', token)
  // 1) Get user based on the token
  const decoded = verifyToken(token, next)
  const emailDecoded = decoded.email
  const email = req.body.email

  const password = req.body.password
  const passwordConfirm = req.body.passwordConfirm

  if ((emailDecoded && email) === false) {
    return next(new AppError('As informações do email da requisição estão incorretas!', 401))
  }

  if (emailDecoded !== email) {
    return next(new AppError('O email informado na requisição diferem do token!', 401))
  }

  if ((password && passwordConfirm) === false) {
    return next(new AppError('O password ou o password de confirmação não foi informado!', 401))
  }

  if (password !== passwordConfirm) {
    return next(new AppError('O password informado difere do password de confirmação!', 401))
  }

  const user = await User.findOne({ email })

  if (!user) {
    return next(new AppError('Usuário não encontrado para este email!', 401))
  }

  const role = user.role
  if (!role) {
    role = 'user'
  }

  const tokenConfirm = signToken({ email, role }, next)

  user.password = password
  user.passwordConfirm = passwordConfirm
  user.tokenConfirm = tokenConfirm

  await user.save()

  res.status(200).json({
    status: 'success',
    message: 'Sua nova senha foi atualizada!',
  })
})

//
const updateMyPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user from collection
  const { email } = req.body
  const user = await User.findOne({ email }).select('+password')

  // 2) Check if POSTed current password is correct
  if (!(await user.matchPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('O seu password atual está errado!', 401))
  }

  // 3) If so, update password
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res)
})

module.exports = {
  register,
  confirmUserEmail,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  updatePassword,
  updateMyPassword,
}
