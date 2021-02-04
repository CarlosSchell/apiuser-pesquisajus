import jwt from 'jsonwebtoken'
import AppError from './../utils/appError.js'

const signToken = (user) => {
  const payload = { email: user.email,role: user.role }
  console.log(process.env.JWT_SECRET)
  const tokenGenerated = jwt.sign(
    payload, 
    process.env.JWT_SECRET, 
    { algorithm: ['RS256'], expiresIn: (process.env.JWT_TOKEN_EXPIRES_IN_HOURS * 60 * 60)
  }, (err, user) => {
    //console.log(token)
    return (new AppError('Erro na geração do Token !', 403))
})
  return tokenGenerated
}

const createSendToken = (user, statusCode, req, res) => {
  // Gera o Token
  const token = signToken(user)
  //console.log('Data do token', token.expiresIN)
  // Grava o cookie com o jwt token
  res.cookie('jwt', token, {
    expires: new Date(
      (Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN_HOURS * 60 * 60 * 1000))
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  })
  //console.log('Data do Cookie -', (Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN_HOURS * 60 * 60 * 1000)))
  // Remove password from output
  user.password = undefined
  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  })
}

export default createSendToken
