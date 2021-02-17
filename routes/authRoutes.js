const express = require('express')

const { confirmUserEmail, forgotPassword, updatePassword }  = require('../controllers/authController.js')

const router = express.Router()

router.get('/confirm/:token', confirmUserEmail)
router.post('/users/forgotpassword/', forgotPassword)
router.patch('/updatepassword/:token', updatePassword)

module.exports = router
