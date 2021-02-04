import crypto from 'crypto'
import { promisify } from 'util'
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'

import User from './../models/userModel.js'
import AppError from './../utils/appError.js'
//import createSendToken from './../utils/createSendToken.js
import criaEnviaToken from './../utils/criaEnviaToken.js'
//import Email from './../utils/email.js'
import sendMail from './../utils/sendMail.js'
import { CLIENT_RENEG_LIMIT } from 'tls'

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body
  //console.log(email)
  //console.log(password)
  // error.response && error.response.data.message
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400))
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email: email }) //.select('+password')
  // console.log(user)
  if (!user || !(await user.matchPassword(password, user.password))) {
    return next(new AppError('O email ou a senha estão incorretos !', 401))
  }
  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res)
})

const register = asyncHandler(async (req, res, next) => {
  console.log(req.body)
  const { name, email, password } = req.body

  const userExists = await User.findOne({ email })
  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: 'user',
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  })

  // Envia email de confirmação
  // console.log(newUser)
  // const url = `${req.protocol}://${req.get('host')}/me`
  // console.log(url);
  // await new Email(newUser, url).sendWelcome()
  //
  // Send User data without token
  // res.status(201).json({ status: 'success', user: newUser })

  criaEnviaToken(newUser, 201, req, res)

  // createSendToken(newUser, 201, req, res)
})

const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })
  res.status(200).json({ status: 'success' })
}

const protect = asyncHandler(async (req, res, next) => {
  // 1) Getting token and check if it's there

  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    )
  }

  // 2) Read and Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_PUBLIC, {
    algorithm: ['RS256']
  })

  // Como o token é gerado
  // const tokenGenerated = jwt.sign(
  //   payload,
  //   process.env.JWT_SECRET,
  //   { algorithm: ['RS256'], expiresIn: (process.env.JWT_TOKEN_EXPIRES_IN_HOURS * 60 * 60)
  // })

  // console.log(decoded)

  // 3} Assign Token data do req
  req.email = decoded.email
  req.role = decoded.role

  //console.log(req.email)
  //console.log(req.role)

  // console.log(decoded)

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

      return next(
        new AppError('You do not have permission to perform this action', 403)
      )

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

const forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError('There is no user with email address.', 404))
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  console.log(resetToken)

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`

    // Send Email with Sendgrid
    const msg = {
      to: user.email,
      from: 'carlos.schellenberger@gmail.com', // Use the email address or domain you verified above
      subject: 'Bem vindo ao pesquisajus ! Confirme o seu email',
      text: '***********textnulo*************',
      // html: html
      html: `<div> 
      <p>Seja bem vindo ao site pesquisajus1</p><br>
      <p>Por favor clique no link abaixo para confirmar o seu email<p><br>
      <p>${resetURL}</p></br><
      <button type="button" href="${resetURL}">Confirmo o meu email ${user.email}</button><br></div>`,
    }

    console.log(msg)

    await sendMail(msg)

    res.status(200).json({
      status: 'success',
      message: 'O link de confirmação da senha foi enviada para o email',
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    )
  }
})

const resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res)
})

const updateMyPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user from collection
  const { email } = req.body
  const user = await User.findOne({ email }).select('+password')

  // 2) Check if POSTed current password is correct
  if (!(await user.matchPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401))
  }

  // 3) If so, update password
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res)
})

export {
  register,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updateMyPassword,
}
