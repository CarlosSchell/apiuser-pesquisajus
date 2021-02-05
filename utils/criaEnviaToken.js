

const criaEnviaToken = (user, statusCode, req, res) => {
  // const token = signToken(user)
  // Grava o cookie com o jwt token
  // res.cookie('jwt-pj', token, {
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN_HOURS * 60 * 60 * 1000
  //   ),
  //   httpOnly: true,
  //   secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  // })

  // Remove password from output
  // user.password = undefined
  // res.status(statusCode).json({
  //   status: 'success',
  //   token,
  //   user,
  // })
  // return token
}

