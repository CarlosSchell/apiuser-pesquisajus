const jwt = require('jsonwebtoken')
const AppError = require('./../utils/appError.js')

// jwt from 'jsonwebtoken'

const verifyToken = async (token, next) => {
  //const tokenKey = fs.readFileSync('private.key')
  // Algoritmo RSA 512 - Chaves com 1024 bits de tamanho
  const tokenKey = process.env.JWT_PUBLIC

  // const tokenKey="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArDSpn5yMf+L+AZcmbG90\n45eoyNMVX0rogpDxSY9WePD9k4swvt7XIYVr7ECz7fkk7fzZLNIOjCCZi8Mv+0Gh\njVoaBhwQlMFAaUDV0drUKdBR/rnNctmJ7rKSYkc5+8VQGMDTwlvld0Zm76DJOvWA\nUOlDCkzodUZa0v6zwSV750daP6zRgnLcE5Q1rpUIlbAsCDzf+xK/MFp9aCnuEWg3\nS8nu9ImkPUWVoezQgP7lWTUq9emmf9Nx9HaTk7TFAjQvqHshkUCMUctH2ObCAllB\n+5OUvFwLfb2rA5YdQV/rmwTcyDs0CAAC+/WyaxRRugsSbWIRCmrEAoT6XDipt0XK\nEwIDAQAB\n-----END PUBLIC KEY-----"

  // tokenDecoded = await promisify(jwt.verify)(token, process.env.JWT_PUBLIC, {
  //   algorithm: ['RS256'],
  // })
  let tokenDecoded
  try {
    tokenDecoded = jwt.verify(token, process.env.JWT_PUBLIC, {
      algorithm: ['RS256'],
    })
  } catch (err) {
    next(new AppError('Erro na verificação do token - ' + err.message, 500))
  }

  //console.log('Passou pelo verifyToken', tokenDecoded)

  return tokenDecoded
}

module.exports = verifyToken
