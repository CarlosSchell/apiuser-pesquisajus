const jwt = require('jsonwebtoken')
const AppError = require('./../utils/appError.js')

const verifyToken =  (token, next) => {
  //const tokenKey = fs.readFileSync('private.key')
  // Algoritmo RSA 512 - Chaves com 1024 bits de tamanho

  let tokenDecoded
  try {
    tokenDecoded = jwt.verify(token, process.env.JWT_PUBLIC, {
      algorithm: ['RS256'],
    })
  } catch (err) {
    next(new AppError('Erro na verificação do token! - ' + err.message, 500))
  }

  return tokenDecoded
}

module.exports = verifyToken
