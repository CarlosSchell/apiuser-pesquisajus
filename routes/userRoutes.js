const express = require('express')
const { getAllUsers, getMe, getOneUser } = require('./../controllers/userController.js')
const { getProcessos,gravaProcessos }  = require('./../controllers/procController.js')

const {
  register,
  login,
  logout,
  protect,
  restrictTo,
  updateMyPassword,
}  = require('./../controllers/authController.js')

const router = express.Router()

router.post('/register', register)
// router.get('/confirm/:token', confirmUserEmail)
router.post('/login', login)
router.patch('/logout', logout)

router
  .route('/')
  .get(getAllUsers)
//.post(userController.createUser);

// Protect all routes after this middleware
router.use(protect)
// router.use(restrictTo(['user','premium','master','admin']));

router.patch('/updateMyPassword', updateMyPassword)

router.get('/getprocessos', getProcessos)
router.patch('/gravaprocessos', gravaProcessos)

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

// router.route('/:id').get(getOneUser)
// .patch(userController.updateUser)
// .delete(userController.deleteUser);

module.exports = router
