const express = require('express')

const {
  postEsPublicacaoProcesso,
  postEsPublicacaoTexto,
  postEsPublicacaoOAB,
} = require('./../controllers/procEsController.js')

const router = express.Router()

router.post('/processo', postEsPublicacaoProcesso)
router.post('/texto', postEsPublicacaoTexto)
router.post('/oab', postEsPublicacaoOAB)

module.exports = router
