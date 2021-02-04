import jwt from 'jsonwebtoken'
import fs from 'fs'
import AppError from './../utils/appError.js'

const signToken = async (user) => {
  const tokenData = { email: user.email, role: user.role }
  const tokenOptions = { 
    algorithm: 'RS512', 
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN_HOURS * 60 * 60 
  }
  //const tokenKey = fs.readFileSync('private.key')
  const tokenKey = process.env.PRIVATE_KEY  
  console.log('Chave Privada : ', tokenKey)
  let tokenGenerated = ''
  tokenGenerated = jwt.sign(
    tokenData,
    tokenKey,
    tokenOptions,
    (err) => {
      return new AppError('Erro na geração do Token !', 403)
    }
  )
  console.log('Token Gerado : ', tokenGenerated)
  return tokenGenerated
}

const criaEnviaToken = async (user, statusCode, req, res) => {
  token = await signToken(user)
  // Grava o cookie com o jwt token
  res.cookie('jwt', token, {
    expires: new Date(
    Date.now() + 
    process.env.JWT_COOKIE_EXPIRES_IN_HOURS * 60 * 60 * 1000
    ),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    }
  )
  // Remove password from output
  user.password = undefined
  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  })
        // return token
}

  


export default criaEnviaToken
