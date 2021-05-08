const express = require('express')
const dotenv = require('dotenv')
const sendEmail = require('../email/sendEmail.js')

const { welcomepage, enviaEmailContato } = require('./../controllers/generalController.js')

const router = express.Router()

router.get('/welcome', welcomepage)
router.post('/enviaemail', enviaEmailContato)

module.exports = router
