'use strict'
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')

dotenv.config()

let user = process.env.EMAIL_USER
let pass = process.env.EMAIL_PASS

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: 'mail.pesquisajus.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user,
    pass,
  },
})


// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async (to, from, subject, text, html) => {
  //try {
  let info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  })
  // } catch {
  //   console.log(error)
  // }

  // console.log('Message sent: %s', info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

}

module.exports = sendEmail
