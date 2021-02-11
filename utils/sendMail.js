const sgMail = require('@sendgrid/mail')

const sendMail = async (msg) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  sgMail.send(msg)
  .then(() => {},
    (error) => { 
      console.error(error)
      if (error.response) {
        console.error(error.response.body)
      }
    }
  )
}

export default sendMail