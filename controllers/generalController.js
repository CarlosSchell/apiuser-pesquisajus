const welcomepage = (req, res, next) => {
  console.log('Entrou no welcomepage !')
  res.status(200).json({
    status: 'success',
    message: 'Api do pesquisajus! - Versao - 27Fev2021- 14:25hs',
  })
}

module.exports = {
  welcomepage,
}
