const fs = require('fs')
const asyncHandler = require('express-async-handler')
const Publicacao = require('./../models/publicacaoModel.js')
const User = require('./../models/userModel.js')
const AppError = require('./../utils/appError.js')
const verifyToken = require('./../utils/verifyToken.js')

//
const getProcessos = asyncHandler(async (req, res, next) => {
  console.log('Entrou no getProcessos !')
  console.log('req.headers.authorization !', req.headers.authorization)

  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('O token de autorização não válido! Solicite nova confirmação de senha', 401))
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

  let processos
  if (user.processos) {
    processos = user.processos
  } else {
    processos = []
  }

  res.status(200).json({
    status: 'success',
    message: 'Foram enviados os dados dos processos do usuário !',
    data: {
      email,
      processos,
    },
  })
})

//
const gravaProcessos = asyncHandler(async (req, res, next) => {
  console.log('Entrou no gravaProcessos !')

  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('O token de autorização não válido! Solicite nova confirmação de senha', 401))
  }

  console.log('Token:', token)
  console.log('Body:', req.body)

  const decoded = verifyToken(token, next) //Synchronous

  console.log('Decoded:', decoded)

  const email = decoded.email

  let processos

  if (req.body.processos) {
    processos = req.body.processos
  } else {
    processos = []
  }

  if (!email) {
    return next(new AppError('O email do usuário não foi fornecido!', 400))
  }

  const user = await User.findOneAndUpdate({ email }, { processos }, { new: true })

  // const user = await User.findOne({ email })

  if (!user) {
    return next(new AppError('Usuário não encontrado para este email!', 401))
  }

  res.status(200).json({
    status: 'success',
    message: 'Foram gravados os dados dos processos do usuário !',
    publicacao,
  })
})


const getPublicacao = asyncHandler(async (req, res, next) => {
  console.log('Entrou no getPublicacao !')
  // console.log('req.headers.authorization !', req.headers.authorization)

  const processo = req.params.processo
  // let token
  // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
  //   token = req.headers.authorization.split(' ')[1]
  // }

  // if (!token) {
  //   return next(new AppError('O token de autorização não válido!', 401))
  // }

  // const decoded = verifyToken(token, next)  //Synchronous

  // if (decoded !== '') {
  //   // send message invalid token
  // }

  const data = await Publicacao.find({ processo })
  console.log(data)

  let publicacoes = []
  if (data) {
    publicacoes = data
  }

  res.status(200).json({
    status: 'success',
    message: `Processo ${processo}`,
    data: {
      publicacoes,
    },
  })
})


const getPublicacaoTexto = asyncHandler(async (req, res, next) => {
  console.log('Entrou no getPublicacaoTexto !')
  // console.log('req.headers.authorization !', req.headers.authorization)

  // const query = { $text: { $search: `"\"{texto}\""` }}
  // const query = `"\"${texto}\""`
  // const texto_editado = `"\\"${texto}\""`
  //console.log('Query : ',query)
  // "\"GISELE DOS SANTOS SILVA\""
  // db.getCollection('publicacaos').find({$text: { $search: "\"GISELE DOS SANTOS SILVA\"" }}) 
  
  const nome = req.params.nome
  //console.log('Texto pra buscar : ', nome)
  //const str_busca = '\"' + texto +'\"'
  //const nome = 'GISELE DOS SANTOS SILVA'
  //const str_busca = "\"GISELE DOS SANTOS SILVA\""

  const str_busca = `\"${nome}\"`
  console.log('str_busca : ', str_busca)

  //const data = await Publicacao.find({ $text: { $search: "\"${str_busca}\"" }})
  const data = await Publicacao.find({ $text: { $search: str_busca }}).limit(200)
  
  // let token
  // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
  //   token = req.headers.authorization.split(' ')[1]
  // }

  // if (!token) {
  //   return next(new AppError('O token de autorização não válido!', 401))
  // }

  // const decoded = verifyToken(token, next)  //Synchronous

  // if (decoded !== '') {
  //   // send message invalid token
  // }

  // const data = await Publicacao.find({ $text: { $search: "java coffee shop" }})
  // const data = await Publicacao.find({ $text: { $search: "\"coffee shop\"" }})

  // const data = await Publicacao.find({ $text: { $search: texto }})

  // console.log(data)

  let publicacoes = []
  if (data) {
    publicacoes = data
  }

  res.status(200).json({
    status: 'success',
    message: `Texto buscado ${str_busca}`,
    data: {
      publicacoes,
    },
  })
})


//
const gravaPublicacao = asyncHandler(async (req, res, next) => {
  //console.log('Entrou no gravaPublicacao !')
  //console.log('req.headers.authorization !', req.headers.authorization)

  const publicacao = req.body
  const processo = req.body.processo

  // console.log('publicacao : ', req.body)
  console.log('processo : ', req.body.processo)

  // let token
  // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
  //   token = req.headers.authorization.split(' ')[1]
  // }

  // if (!token) {
  //   return next(new AppError('O token de autorização não foi corretamente informado!', 401))
  // }

  // const decoded = verifyToken(token, next)  //Synchronous

  // if (decoded !== '') {
  //   return next(new AppError('Token com dados inválidos', 401))
  // }

  const data = await Publicacao.create(publicacao)

  if (!data) {
    return next(new AppError(`Erro ao gravar a nova publicacao ${processo}`, 500))
  }

  //console.log(data)

  id_publicacao = data._id
  console.log('id_publicacao : ', id_publicacao)

  res.status(200).json({
    status: 'success',
    message: `Processo ${processo}`,
    data: {
      id_publicacao,
      publicacao
    },
  })
})

//
const uploadJson = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: `Arquivo Json enviado`,
  })
})

const gravaDiario = asyncHandler(async (req, res, next) => {
  //console.log(req.body)
  publicacoes = req.body

  // arquivo = req.body.arquivo
  // const readFileAsync = promisify(fs.readFile)
  //const diretorio = '../www/public/dados/tjrs/json/'+arquivo
  // const publicacao = []
  // console.log(diretorio)
  // const jsonString = fs.readFileSync('./customer.json')
  // const jsonString = fs.readFileSync(diretorio, 'utf8')
  // const publicacao = JSON.parse(jsonString)
  // fs.readFile(diretorio, 'utf8', (err, publicacao) => {
  //   if (err) {
  //       console.log("File read failed:", err)
  //       return
  //   }
  //   // console.log('File data:', publicacao) 
  // })
  //publicacao.forEach(item => console.log(item))
  // Publicacao.insertMany(publicacao).then(function(){ 
  //   console.log("Data inserted")  // Success 
  // }).catch(function(error){ 
  //   console.log(error)      // Failure 
  // });


  const data = await Publicacao.insertMany(publicacoes)

  if (!data) {
    return next(new AppError(`Erro ao gravar o banco de dados`, 500))
  } else {
    console.log('Dados inseridos com sucesso !')
  }

  // console.log(publicacao)

  res.status(200).json({
    status: 'success',
    message: `Database atualizado`,
  })
})


module.exports = {
  getProcessos,
  gravaProcessos,
  getPublicacao,
  getPublicacaoTexto,
  gravaPublicacao,
  uploadJson,
  gravaDiario
}


// const gravaProcessos = asyncHandler(async (req, res, next) => {
//   //console.log(req)
//   const processos = req.body.processos
//   console.log('Processos : ',processos)
//   const { email, role } = req
//   console.log('Email : ', email)

//   const data = await User.findOneAndUpdate(
//     { email },
//     { processos},
//     { new: true }
//   )

//   if (!data) {
//     return next(new AppError('Usuário não encontrado!', 400))
//   }

//   res.status(201).json({
//     status: 'success',
//     email,
//     processos
//   })
// })
