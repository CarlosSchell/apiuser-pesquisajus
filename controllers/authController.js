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

dotenv.config()

// Index
// 022 - register,          // send html with email confirm request
// 098 - confirmEmail,      // Confirms user email in initial registration
// 140 - confirmPassword,   // receives forgot password change request (outside app) - and confirms it into db
// 187 - login,
// 259 - logout,
// 271 - protect,
// 321 - restrictTo,
// 346 - forgotPassword,     // send html with password confirm request
// 401 - changePassword,     // receives password change request (inside app) - and confirms it into db

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

  const tokenEmailConfirm = signToken({ email }, next) /// Atenção - não é o user token !!!!

  console.log('tokenEmailConfirm', tokenEmailConfirm)

  const user = await User.create({
    name,
    email,
    role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    processos: [],
    isLoggedInUser: false,
    isConfirmedUser: false,
    tokenEmailConfirm,
  })

  if (!user) {
    return next(new AppError('Erro ao gravar o novo usuário', 500))
  }

  // Sends email html confirmation request
  const hostFrontend = 'www.pesquisajus.com.br'
  const url = `${req.protocol}://${hostFrontend}/confirmemail/${tokenEmailConfirm}`

  //const url = `${req.protocol}://${req.get('host')}api/v1/users/confirm/${email}`
  // const url = `${req.protocol}://${req.get('host')}/confirmemail/${tokenConfirm}`

  const to = user.email
  const from = `Contato <${process.env.EMAIL_USER}>` // 'contato@pesquisajus.com'
  const subject = 'Bem vindo ao pesquisajus! - Por favor confirme o seu email'
  const text = ''

  const htmlConfirmLink = `<div style="text-align:center; font-weigth: 500; line-height:1.2; color: #5a5a5a; font-family: Montserrat, -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;', 'Courier New', monospace;">
      <div style="font-size: 3rem; margin: 0;">pesquisajus</div>
      <p style="font-size: 1.8rem;">Confirmar Email</p>
      <p style="font-size: 1.6rem;"> Olá <strong>${name}</strong>!</p>
      <p style="font-size: 1.4rem;">Bem vindo ao pesquisajus!</p>
      <p style="font-size: 1.4rem;">Clique no link abaixo para confirmar o seu email!</p>
      <button style="color:black; font-size:1.4rem;  background-color:lightblue; padding:15px 20px"><a style="color:black; text-decoration:none;";  href="${url}">Confirmar E-mail</a></button>
      <p style="font-size: 1.4rem;">Ou se preferir copie e cole o link abaixo:</p>
      <p style="font-size: 1.0rem;"></p>${url}</p>
      <hr>
      <p style="font-size: 1.4rem;">Por favor ignore esta mensagem, caso voce não tenha solicitado este email</p>
    </div>`

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
const confirmEmail = asyncHandler(async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  // console.log(token)

  if (!token) {
    return next(new AppError('O token de autorização não válido! Solicite nova confirmação de email', 401))
  }

  const decoded = verifyToken(token, next) //Synchronous

  const email = decoded.email
  const user = await User.findOne({ email })

  if (!user) {
    return next(new AppError(`Usuário não encontrado para este email ${email}`, 404))
  }

  if (token !== user.tokenEmailConfirm) {
    console.log('Token : ', token)
    console.log('tokenEmailConfirm : ', user.tokenEmailConfirm)
    return next(new AppError('O token de autorização não válido! Solicite novo link de confirmação !', 404))
  }

  user.isConfirmedUser = true
  user.tokenEmailConfirm = ''
  await user.save()

  console.log('O email do usuário foi confirmado!')

  res.status(200).json({
    status: 'success',
    message: 'O email do usuário foi confirmado!',
    user: {
      email: user.email,
    },
  })
})

//
const confirmPassword = asyncHandler(async (req, res, next) => {
  console.log('Entrou no changePassword !')
  //try/catch para o decoded ??

  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('O token de autorização não válido! Solicite nova confirmação de senha', 401))
  }

  const decoded = verifyToken(token, next) //Synchronous
  const email = decoded.email
  const user = await User.findOne({ email })

  if (!user) {
    return next(new AppError(`Usuário não encontrado para este email ${email}`, 404))
  }

  if (token !== user.tokenPasswordConfirm) {
    return next(
      new AppError(
        `O token de autorização não válido! Entre no login novamente para solicitar novo link de confirmação !`,
        404
      )
    )
  }

  // Na versão final ativar estas linhas
  user.tokenPasswordConfirm = ''
  await user.save()

  res.status(200).json({
    status: 'success',
    message: 'O email do usuário foi confirmado!',
    user: {
      email: user.email,
    },
  })
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
      processos: data.processos,
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
  const decoded = verifyToken(token, next)
  // console.log(decoded)

  // 3} Put extracted token data in the req (not in the body !!!)
  req.email = decoded.email
  req.role = decoded.role

  console.log('Token decoded data : ', decoded)
  console.log('Inside protect : req.email : ', req.email)
  console.log('Inside protect : req.role  : ', req.role)
  //console.log(req.role)

  // GRANT ACCESS TO PROTECTED ROUTE
  // req.user = currentUser
  // res.locals.user = currentUser
  next()
})

//
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

// forgotPassword envia email para o usuário confirmar pelo confirmPassword
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

    user.tokenPasswordConfirm = token
    user.save()

    // Envia email de confirmação
    //const url = `${req.protocol}://${req.get('host')}api/v1/users/confirm/${email}`
    const hostFrontend = 'www.pesquisajus.com.br'
    const url = `${req.protocol}://${hostFrontend}/confirmpassword/${token}`

    const name = user.name
    const to = user.email
    const from = `Contato <${process.env.EMAIL_USER}>` // 'contato@pesquisajus.com'
    const subject = 'pesquisajus - Link para mudança de senha'
    const text = ''

    const htmlConfirmLink = `<div style="text-align:center; font-weigth: 500; line-height:1.2; color: #5a5a5a; font-family: Montserrat, -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;', 'Courier New', monospace;">
      <div style="font-size: 3rem; margin: 0;">pesquisajus</div>
      <p style="font-size: 1.8rem;">Cadastrar nova Senha</p>
      <p style="font-size: 1.6rem;"> Olá <strong>${name}</strong>!</p>
      <p style="font-size: 1.4rem;">Voce solicitou um link para mudar a sua senha!</p>
      <p style="font-size: 1.4rem;">Clique no link abaixo para cadastrar a sua nova senha!</p>
      <button style="color:black; font-size:1.4rem;  background-color:lightblue; padding:10px 15px"><a style="color:black; text-decoration:none;";  href="${url}">Cadastrar Nova Senha</a></button>
      <p style="font-size: 1.4rem;">Ou se preferir copie e cole o link abaixo:</p>
      <p style="font-size: 1.0rem;"></p>${url}</p>
      <hr>
      <p style="font-size: 1.4rem;">Por favor ignore esta mensagem, caso voce não tenha solicitado este email</p>
    </div>`

    await sendEmail(to, from, subject, text, htmlConfirmLink, url) //.catch(console.error)

    res.status(200).json({
      status: 'success',
      message: 'O link para o cadastro de nova senha foi enviado para o email',
    })
  }
})

//
const changePassword = asyncHandler(async (req, res, next) => {
  console.log('Entrou no changePassword !')
  //try/catch para o decoded ??

  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('O token de autorização não válido! Solicite nova confirmação de senha', 401))
  }

  const decoded = verifyToken(token, next) //Synchronous

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

module.exports = {
  register,
  confirmEmail, // Confirms user email in initial registration
  confirmPassword, // receives forgot password change request (outside app) - and confirms it into db
  login,
  logout,
  protect,
  restrictTo,
  changePassword, // send html with password confirm request
  forgotPassword, // receives password change request (inside app) - and confirms it into db
}
