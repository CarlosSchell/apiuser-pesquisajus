const mongoose = require('mongoose')
// const validator = require('validator')

const publicacaoSchema = new mongoose.Schema({
  uf: {
    type: String,
    required: [true, 'Erro no campo : uf'],
    uppercase: true,
    trim: true,
    minlength: 2,
    maxlenght: 2,
  },
  tribunal: {
    type: String,
    required: [true, 'Erro no campo : tribunal'],
    uppercase: true,
    trim: true,
    minlength: 2,
    maxlenght: 10,
  },
  cidade: {
    type: String,
    required: [true, 'Erro no campo : cidade'],
    uppercase: true,
    trim: true,
    maxlenght: 60,
  },
  grau: {
    type: String,
    required: [true, 'Erro no campo : grau'],
    enum: ['1', '2'],
    uppercase: true,
    trim: true,
    minlength: 1,
    maxlenght: 1,
  },
  gname: {
    type: String,
    required: [true, 'Erro no campo : gname'],
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
  pagina: {
    type: String,
    required: [true, 'Erro no campo : pagina'],
    trim: true,
    maxlenght: 20,
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
  foro: {
    type: String,
    required: [true, 'Erro no campo : foro'],
    trim: true,
    maxlenght: 120,
  },
  vara: {
    type: String,
    required: [true, 'Erro no campo : vara'],
    trim: true,
    maxlenght: 120,
  },
  tipo: {
    type: String,
    //required: [true, 'Erro no campo : tipo'],
    trim: true,
    maxlenght: 80,
  },
  recurso: {
    type: String,
    //required: [true, 'Erro no campo : tipo'],
    trim: true,
    maxlenght: 80,
  },
  desctipo: {
    type: String,
    //required: [true, 'Erro no campo : tipo'],
    trim: true,
  },
  processo: {
    type: String,
    required: [true, 'Erro no campo : processo'],
    trim: true,
    minlength: 25,
    maxlenght: 25,
  },
  outronumero: {
    type: String,
    maxlenght: 25,
  },
  origemg1: {
    type: String,
    maxlenght: 25,
  },
  partes: {
    type: String,
  },
  assunto: {
    type: String,
    //required: [true, 'Erro no campo : assunto'],
    trim: true,
    maxlenght: 80,
  },
  decisao: {
    type: String,
  },
})

const Publicacao = mongoose.model('Publicacao', publicacaoSchema)

module.exports = Publicacao

// userSchema.pre('save', async function (next) {
//   // Only run this function if password was actually modified
//   if (!this.isModified('password')) return next()

//   // Hash the password with cost of 12
//   const salt = await bcrypt.genSalt(12)
//   this.password = await bcrypt.hash(this.password, salt)

//   // Delete passwordConfirm field
//   this.passwordConfirm = undefined
//   next()
// })

// userSchema.pre('save', function (next) {
//   if (!this.isModified('password') || this.isNew) return next()

//   this.passwordChangedAt = Date.now() - 1000
//   next()
// })

// publicacaoSchema.pre(/^find/, function (next) {
//   // this points to the current query
//   this.find({ isActiveUser: { $ne: false } })
//   next()
// })

// publicacaoSchema.methods.matchPassword = async function (candidatePassword, userPassword) {
//   return await bcrypt.compare(candidatePassword, userPassword)
// }

// passwordConfirm: {
//   type: String,
//   required: [true, 'Por favor confirme a sua senha'],
//   minlength: [6, 'A senha deve ter no mínimo 6 caracteres'],
//   maxlenght: [60, 'A senha deve ter no máximo 60 caracteres'],
//   select: false,
//   validate: {
//     // This only works on CREATE and SAVE!!!
//     validator: function (el) {
//       return el === this.password
//     },
//     message: 'As senhas devem ser identicas!',
//   },
// },
