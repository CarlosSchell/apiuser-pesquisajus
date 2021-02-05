import mongoose from 'mongoose'
import validator from 'validator'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { stringify } from 'querystring'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Entre com o seu nome de usuário até 20 letras!'],
    },
    email: {
      type: String,
      required: [true, 'Por favor informe o seu email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Email inválido!'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'premium', 'super', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Por favor digite a sua senha'],
      minlength: [6, 'A senha deve ter no mínimo 6 caracteres'],
      maxlenght: [60, 'A senha deve ter no máximo 60 caracteres'],
      //select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Por favor confirme a sua senha'],
      minlength: [6, 'A senha deve ter no mínimo 6 caracteres'],
      maxlenght: [60, 'A senha deve ter no máximo 60 caracteres'],
      select: false,
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password
        },
        message: 'As senhas devem ser identicas!',
      },
    },
    isActiveUser: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    token: String,
  },
  {
    timestamps: true,
  }
)

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next()

  // Hash the password with cost of 12
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)

  // Delete passwordConfirm field
  this.passwordConfirm = undefined
  next()
})

// userSchema.pre('save', function (next) {
//   if (!this.isModified('password') || this.isNew) return next()

//   this.passwordChangedAt = Date.now() - 1000
//   next()
// })

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ isActiveUser: { $ne: false } })
  next()
})

userSchema.methods.matchPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

// userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10
//     )

//     return JWTTimestamp < changedTimestamp
//   }

//   // False means NOT changed
//   return false
// }

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}

const User = mongoose.model('User', userSchema)

export default User
