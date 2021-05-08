const { Client } = require('@elastic/elasticsearch')
// const dotenv = require('dotenv')

const asyncHandler = require('express-async-handler')
// const Publicacao = require('./../models/publicacaoModel.js')
const User = require('./../models/userModel.js')
const Diario = require('./../models/diarioModel.js')
const AppError = require('./../utils/appError.js')
const verifyToken = require('./../utils/verifyToken.js')

const client = new Client({
  node: 'http://pesquisajus.vps-kinghost.net:9200',
  auth: {
    username: '',
    password: '',
  },
})

const postEsPublicacaoProcesso = asyncHandler(async (req, res) => {
    console.log('Entrou no getEsPublicacaoProcesso !')
    const processo = req.body.processo
  
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
  
    if (!token) {
      return next(new AppError('O token de autorização não é válido!', 401))
    }
  
    const decoded = verifyToken(token, next) //Synchronous
    const email = decoded.email
  
    if (!email) {
      return next(new AppError('O email do usuário não foi fornecido!', 400))
    }
  
    const user = await User.findOne({ email })
  
    if (!user) {
      return next(new AppError('Usuário não encontrado para este email!', 401))
    }
  
    const result = await client.search({
      index: 'publicacoes',
      body: {
        query: { match: { processo: processo } },
        size: 50,
        sort: [{ diario: 'desc' }],
      },
    })
  
    let publicacoes = []
    if (result) {
      publicacoes = result.body.hits.hits
    }
  
    res.status(200).json({
      status: 'success',
      message: 'Foram enviados os dados das publicações !',
      data: {
        publicacoes,
      },
    })
  })

const postEsPublicacaoTexto = asyncHandler(async (req, res) => {
  console.log('Entrou no postPublicacaoTexto !')
  const texto = req.body.texto

  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('O token de autorização não é válido!', 401))
  }

  const decoded = verifyToken(token, next) //Synchronous
  const email = decoded.email

  if (!email) {
    return next(new AppError('O email do usuário não foi fornecido!', 400))
  }

  const user = await User.findOne({ email })

  if (!user) {
    return next(new AppError('Usuário não encontrado para este email!', 401))
  }

  const result = await client.search({
    index: 'publicacoes',
    body: {
      query: { match_phrase: { decisao: texto } },
      size: 1000,
      sort: [{ diario: 'desc' }],
    },
  })

  let publicacoes = []
  if (result) {
    publicacoes = result.body.hits.hits
  }

  res.status(200).json({
    status: 'success',
    message: `Texto pesquisado ${texto}`,
    data: {
      publicacoes,
    },
  })
})

const postEsPublicacaoOAB = asyncHandler(async (req, res) => {
    // console.log('Entrou no postEsPublicacaoOAB !')
    // // console.log('req.headers.authorization !', req.headers.authorization)
    // const processo = req.params.oab
    // console.log('Número pra buscar : ', processo)
  
    // // const data = await Publicacao.find({ $nroprocesso: str_busca }).limit(50)
    // const data = await Publicacao.find({ processo }).limit(50)
  
    // // let token
    // // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // //   token = req.headers.authorization.split(' ')[1]
    // // }
  
    // // if (!token) {
    // //   return next(new AppError('O token de autorização não válido!', 401))
    // // }
  
    // // const decoded = verifyToken(token, next)  //Synchronous
  
    // // if (decoded !== '') {
    // //   // send message invalid token
    // // }
  
    // let publicacoes = []
    // if (data) {
    //   publicacoes = data
    // }
  
    // res.status(200).json({
    //   status: 'success',
    //   message: `Numero OAB buscado ${oab}`,
    //   data: {
    //     publicacoes,
    //   },
    // })
  })

module.exports = {
  postEsPublicacaoProcesso,
  postEsPublicacaoTexto,
  postEsPublicacaoOAB,
}
