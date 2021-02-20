const express = require('express')

const { confirmUserEmail, forgotPassword, updatePassword }  = require('../controllers/authController.js')

const router = express.Router()

router.get('/confirm/:token', confirmUserEmail)
router.post('/forgotpassword/', forgotPassword)
router.patch('/users/updatepassword', updatePassword)

module.exports = router
