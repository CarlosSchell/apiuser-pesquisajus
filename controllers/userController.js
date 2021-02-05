import asyncHandler from 'express-async-handler'
import User from './../models/userModel.js'

import AppError from './../utils/appError.js'

import { uploadUserPhoto, resizeUserPhoto } from './../utils/uploadUserPhoto.js'

// import factory from './handlerFactory.js'

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

const getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

const updateMe = asyncHandler(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    )
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email')
  if (req.file) filteredBody.photo = req.file.filename

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  })
})

const deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null,
  })
})

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  })
}

//const getUser = factory.getOne(User);
//const getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
// const updateUser = factory.updateOne(User);
// const deleteUser = factory.deleteOne(User);

const getAllUsers = asyncHandler(async (req, res, next) => {
  let query = User.find({})
  const user = await query
  res.status(200).json({
    status: 'success',
    users: user,
  })
})

const getOneUser = asyncHandler(async (req, res, next) => {
  let query = User.findOne({ email: req.params.id })
  const user = await query
  if (!user) {
    return next(
      new AppError(
        `Usuário não encontrado para este email ${req.params.id}`,
        404
      )
    )
  }
  res.status(200).json({
    status: 'success',
    user,
  })
})

export { getAllUsers, getOneUser }

// const filterObj = (obj, ...allowedFields) => {
//   const newObj = {};
//   Object.keys(obj).forEach(el => {
//     if (allowedFields.includes(el)) newObj[el] = obj[el];
//   });
//   return newObj;
// };
