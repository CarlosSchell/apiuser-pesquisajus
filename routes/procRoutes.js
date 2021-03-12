const express = require('express')
const multer = require('multer')

const { getPublicacao, gravaPublicacao, uploadJson, gravaBancoDados } = require('./../controllers/procController.js')

// console.log('/home/api-pesquisajus/www/public/dados/tjrs')
//diretorio = '/home/www/public/dados/tjrs'
// 'public/data'

//const diretorio = 'public/data'

const diretorio = '../www/public/dados/tjrs'

console.log(diretorio)

const storage = multer.diskStorage({
  destination: (re, file, cb) => {
    cb(null, diretorio)
  },
  filename: (req, file, cb) => {
    const { originalname } = file
    cb(null, originalname)
  },
})
const upload = multer({ storage })

const router = express.Router()

router.get('/:processo', getPublicacao)

// habilitar só admin para esta rota
router.post('/', gravaPublicacao)

router.post('/uploadjson', upload.single('arquivojson'), uploadJson)

router.post('/gravabancodados', gravaBancoDados)

module.exports = router
