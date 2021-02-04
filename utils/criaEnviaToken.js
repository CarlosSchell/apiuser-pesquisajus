import jwt from 'jsonwebtoken'
import AppError from './../utils/appError.js'

const signToken = (user) => {
  const tokenData = { email: user.email, role: user.role }
  const tokenOptions = {
    algorithm: 'RS512',
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN_HOURS * 60 * 60,
  }
  //const tokenKey = fs.readFileSync('private.key')
  // Algoritmo RSA 512
  // Chaves com 1024 bits de tamanho
  const tokenKey = process.env.JWT_PRIVATE
  console.log('Chave Privada : ', tokenKey)

  // jwt.verify(token, pubKey);

  let tokenGenerated = jwt.sign(tokenData, tokenKey, tokenOptions)

  //   , (err) => {
  //   return new AppError('Erro na geração do Token !', 403)
  // })
  console.log('Token Gerado : ', tokenGenerated)

  return tokenGenerated
}

const criaEnviaToken = (user, statusCode, req, res) => {
  const token = signToken(user)
  console.log('Token Após ser Gerado : ', token)
  // Grava o cookie com o jwt token
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN_HOURS * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  })

  // Grava o localStorage (quando estamos no frontend)
  // localStorage.setItem('userInfo', JSON.stringify(token))

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
