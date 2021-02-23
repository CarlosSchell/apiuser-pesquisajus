const express = require('express')
const { welcomepage } = require('./../controllers/generalController.js')

const router = express.Router()

router.get('/', welcomepage)

module.exports = router
