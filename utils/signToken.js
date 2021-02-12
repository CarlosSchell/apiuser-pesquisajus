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

  // const tokenKey='-----BEGIN RSA PRIVATE KEY-----\n'+
  // 'MIIEpAIBAAKCAQEArDSpn5yMf+L+AZcmbG9045eoyNMVX0rogpDxSY9WePD9k4sw\n'+
  // 'vt7XIYVr7ECz7fkk7fzZLNIOjCCZi8Mv+0GhjVoaBhwQlMFAaUDV0drUKdBR/rnN\n'+
  // 'ctmJ7rKSYkc5+8VQGMDTwlvld0Zm76DJOvWAUOlDCkzodUZa0v6zwSV750daP6zR\n'+
  // 'gnLcE5Q1rpUIlbAsCDzf+xK/MFp9aCnuEWg3S8nu9ImkPUWVoezQgP7lWTUq9emm\n'+
  // 'f9Nx9HaTk7TFAjQvqHshkUCMUctH2ObCAllB+5OUvFwLfb2rA5YdQV/rmwTcyDs0\n'+
  // 'CAAC+/WyaxRRugsSbWIRCmrEAoT6XDipt0XKEwIDAQABAoIBABI6TM4ZSwHqbAqN\n'+
  // 'DkMiFRRWJEaFmViJ3EydvPyVUIjisWShshoyCkGBFuhd/O2uloseXXqSDXolpTsX\n'+
  // 'AQgubURCCkklRVgJkKDTfQ6GhDic1WEKF8YVYrVCb545fdi5jP3hw0hqY8KZUCID\n'+
  // 'OemkvN1To4X+mAh51vlIfoxuREw5o7Xp1b/z/HewKbI7DFm6K6HmM5megrXkhow+\n'+
  // 'BYtKifJUc9OKlPB2oq0CfqEomM8K8oSm7oy23xkZihGbYcIZ54HSTA1Lyxs461iw\n'+
  // '0YiuJVISYLhUDnhXY34e2bCl2ji6r+VNN1tX7a4HcwnJEe9OCdmBsQrptpSV7QsK\n'+
  // 'LRj03dkCgYEA4KCaX0L44SLtAFfXJkt0oHY2OKB7RMWQ/RhxEjSLaDLb8vqCCdst\n'+
  // 'KQp3ZviQgy8Y65TufbjyHS2J1OrUzmuxcgjl31u+64DrcyN61bq57Nqi0l89Rvy3\n'+
  // 'ldnGzBAMm3jBiXnd8N9oRp3MTy7vWHYd5Rjr6pzWgKeDPlnyMTnaY+UCgYEAxEHC\n'+
  // 'fRr9FUOptB/8fOMkSF3QRr85QFDotJNO9BjKdYmLaLtQw9xyR3rQsCRqB7C05Zt0\n'+
  // '5Y04puN28T/Bwzy8nrVTkzDAYuQjFci3TwPqir3UITd8nuvm1NvIdchaCMcdVB5P\n'+
  // 'zh3hUhZOQHaPC3tbSqXss3N+I8FI5e6+xW3PhpcCgYEAw1KDyY/3z/TJtwGqwM7e\n'+
  // 'A+WmskjBx4Qv1hSZxaXRDvMilL7FsoJWW5iRSQWcy6V5euhPFR1r0nlVn8Hu9+tn\n'+
  // 'KeyYzkb91dSNZ9oTJqQupclbyagtJXv8ux3aInlWLR6s07kXhysMhlMSZExArWBQ\n'+
  // 'EHVCNwjX8Jk4o1AdLDbNMw0CgYEArUhGugF/XiwdBd6MJ5TCb2btw9mJakFGBlJe\n'+
  // 'juXotPjZ74IcYKMe///vjObJ+7pJLsYg46HaWHhUh9Q8d+8Dt7nwbfDInUhDtjM/\n'+
  // 'rvONPi03xJBiZ0twx5a7G0voOwHb4m7VFe+KB9mMBBzqVj/3riRsp1GdGWLKw8IW\n'+
  // 'DOnVJ0cCgYAMlyglN9EmNKrCuiQaonn3Zb2rfdZf3s/nDTaTTPNLuh/iWbFo5qg5\n'+
  // '0VoslmmodupEwM/zZgNEzFjsxJjEt0xuRwjmcZn0Z4aCgfvh0KtjE/Eo7BLLcyEH\n'+
  // 'c5uDh3y/7ElunupNKMgVnhuCAS5SjZhXB/vzfdGwI5hkgqNm7TBemQ==\n'+
  // '-----END RSA PRIVATE KEY-----'

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