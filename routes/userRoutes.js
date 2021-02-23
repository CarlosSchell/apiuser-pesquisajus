const express = require('express')
const { getAllUsers, getMe, getOneUser } = require('./../controllers/userController.js')
const { getProcessos,gravaProcessos }  = require('./../controllers/procController.js')

const {
  register,
  confirmEmail,          // Confirms user email in initial registration
  confirmPassword,       // receives forgot password change request (outside app) - and confirms it into db
  login,
  logout,
  protect,
  restrictTo,
  changePassword,         // send html with password confirm request
  forgotPassword,         // receives password change request (inside app) - and confirms it into db
  
}  = require('./../controllers/authController.js')


const router = express.Router()

//.post(userController.createUser);

// Unprotected routes
router.post('/register', register)
router.post('/confirmemail', confirmEmail)         // protected in the backend
router.post('/changePassword', changePassword)      // protected in the backend
router.post('/login', login)
router.post('/forgotpassword/', forgotPassword)
router.post('/confirmpassword', confirmPassword)   // protected in the backend

router.get('/getprocessos', getProcessos)                // protected in the backend
router.post('/gravaprocessos', gravaProcessos)          // protected in the backend

router.route('/all').get(getAllUsers)
router.post('/logout', logout)

// Protect all routes after this middleware
// router.use(protect)

// Protected routes - after user login
// router.post('/users/profile', userProfile)

// Restrict all routes after this middleware
// router.use(restrictTo(['user','premium','master','admin']));

// Admin only


// router.patch('/updateMyPassword', updateMyPassword)

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
