import jwt from 'jsonwebtoken'

export const signToken = ({ email, role }) => {
  const tokenData = { email, role }
  const tokenOptions = {
    algorithm: 'RS512',
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN_HOURS * 60 * 60,
  }
  //const tokenKey = fs.readFileSync('private.key')
  // Algoritmo RSA 512 - Chaves com 1024 bits de tamanho
  const tokenKey = process.env.JWT_PRIVATE
  let tokenGenerated
  try {
    tokenGenerated = jwt.sign(tokenData, tokenKey, tokenOptions)
    //console.log(tokenGenerated)
  } catch (err) {
    return next(new AppError('Erro do servidor na geração do token !', 500))
  }
  return tokenGenerated
}