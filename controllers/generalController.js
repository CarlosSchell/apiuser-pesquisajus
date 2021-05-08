const asyncHandler = require('express-async-handler')
const sendEmail = require('../email/sendEmail.js')



const welcomepage = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Api do pesquisajus! - Versao - 04 Maio 2021- 20:00hs',
  })
}


const enviaEmailContato = asyncHandler(async (req, res, next) => {

  const { name, email, message } = req.body

  const to = 'contato@pesquisajus.com'
  const from = email
  const subject = 'Mensagem de Contato - Pesquisajus'
  const text = message
  const html = message

  await sendEmail(to, from, subject, text, html) //.catch(console.error)

  res.status(201).json({
    status: 'success',
    message: 'O email de contato foi enviado!',
    user: {
      name,
      email,
      message,
    },
  })
})

module.exports = {
  welcomepage,
  enviaEmailContato,
}
