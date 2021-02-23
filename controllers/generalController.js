const welcomepage = (req, res, next) => {
  console.log('Entrou no welcomepage !')
  res.status(200).json({
    status: 'success',
    message: 'Bem vindo a api do pesquisajus!',
  })
}

module.exports = {
  welcomepage,
}
