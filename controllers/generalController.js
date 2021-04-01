const welcomepage = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Api do pesquisajus! - Versao - 25 Mar 2021- 14:00hs',
  })
}

module.exports = {
  welcomepage,
}
