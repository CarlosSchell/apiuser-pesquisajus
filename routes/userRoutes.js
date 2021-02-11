const express = require('express')
const { getAllUsers, getOneUser } = require('./../controllers/userController.js')
const {
  register,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updateMyPassword,
}  = require('./../controllers/authController.js')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)

router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)

router
  .route('/')
  .get(getAllUsers)
//   // .post(userController.createUser);

// Protect all routes after this middleware
// router.use(protect)

router.patch('/updateMyPassword', updateMyPassword)
// router.get('/me', userController.getMe, userController.getUser);

// router.patch(
//   '/updateMe',
//   userController.uploadUserPhoto,
//   userController.resizeUserPhoto,
//   userController.updateMe
// );

//router.delete('/deleteMe', userController.deleteMe);

// router.use(restrictTo(['user','premium','master','admin']));

// router.route('/').get(getAllUsers)
// .post(userController.createUser);

router.route('/:id').get(getOneUser)
// .patch(userController.updateUser)
// .delete(userController.deleteUser);

module.exports = router
