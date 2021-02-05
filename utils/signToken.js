import jwt from 'jsonwebtoken'

export const signToken = (user) => {
  const tokenData = { email: user.email, role: user.role }
  const tokenOptions = {
    algorithm: 'RS512',
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN_HOURS * 60 * 60,
  }
  //const tokenKey = fs.readFileSync('private.key')
  // Algoritmo RSA 512 - Chaves com 1024 bits de tamanho
  const tokenKey = process.env.JWT_PRIVATE
  let tokenGenerated = jwt.sign(tokenData, tokenKey, tokenOptions)
  //   , (err) => {eturn new AppError('Erro na geração do Token !', 403)})
  return tokenGenerated
}
