const jwt  = require('jsonwebtoken')
const AppError = require('./../utils/appError.js')

// jwt from 'jsonwebtoken'

const signToken = ({ email, role }, next) => {
  const tokenData = { email, role }
  const tokenOptions = {
    algorithm: 'RS512',
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN_HOURS * 60 * 60,
  }
  //const tokenKey = fs.readFileSync('private.key')
  // Algoritmo RSA 512 - Chaves com 1024 bits de tamanho
  const tokenKey = process.env.JWT_PRIVATE

  // console.log('tokenData :', tokenData)
  // console.log('tokenOptions :', tokenOptions)
  // console.log('tokenKey :', tokenKey)

  let tokenGenerated
  try {
    tokenGenerated = jwt.sign(tokenData, tokenKey, tokenOptions)
    //console.log(tokenGenerated)
  } catch (err) {
    next(new AppError('Erro na geração do token - ' + err.message, 500))
  }
  //console.log('Passou pelo signToken', tokenGenerated)

  return tokenGenerated
}

module.exports = signToken