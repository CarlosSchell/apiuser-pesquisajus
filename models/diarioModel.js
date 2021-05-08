const mongoose = require('mongoose')
// const validator = require('validator')

const diarioSchema = new mongoose.Schema({
  uf: {
    type: String,
    required: [true, 'Erro no campo : uf'],
    uppercase: true,
    trim: true,
    minlength: 2,
    maxlenght: 2,
  },
  cidade: {
    type: String,
    uppercase: true,
    trim: true,
    maxlenght: 60,
  },
  grau: {
    type: String,
    enum: ['1', '2'],
    uppercase: true,
    trim: true,
    minlength: 1,
    maxlenght: 1,
  },
  gname: {
    type: String,
    trim: true,
    maxlenght: 20,
  },
  diario: {
    type: String,
    required: [true, 'Erro no campo : diario'],
    trim: true,
    minlength: 4,
    maxlenght: 6,
  },
  diariotribunal: {
    type: String,
    trim: true,
    minlength: 4,
    maxlenght: 6,
  },
  ano: {
    type: String,
    required: [true, 'Erro no campo : ano'],
    trim: true,
    minlength: 2,
    maxlenght: 2,
  },
  mes: {
    type: String,
    required: [true, 'Erro no campo : mes'],
    trim: true,
    minlength: 2,
    maxlenght: 2,
  },
  dia: {
    type: String,
    required: [true, 'Erro no campo : dia'],
    trim: true,
    minlength: 2,
    maxlenght: 2,
  },
})

const Diario = mongoose.model('Diario', diarioSchema)

module.exports = Diario
