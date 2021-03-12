const welcomepage = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Api do pesquisajus! - Versao - 12Mar2021- 10:00hs',
  })
}

module.exports = {
  welcomepage,
}
