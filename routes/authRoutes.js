const express = require('express')

const { confirmUserEmail, forgotPassword, resetPassword }  = require('../controllers/authController.js')

const router = express.Router()

router.get('/confirm/:token', confirmUserEmail)
router.post('/users/forgotpassword/', forgotPassword)
router.post('/resetpassword/:token', resetPassword)

module.exports = router
