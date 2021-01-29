import express from 'express'
import { getAllUsers, getOneUser } from './../controllers/userController.js'
import {
  register,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updateMyPassword,
} from './../controllers/authController.js'

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Protect all routes after this middleware
router.use(protect);

router.patch('/updateMyPassword', updateMyPassword);
// router.get('/me', userController.getMe, userController.getUser);

// router.patch(
//   '/updateMe',
//   userController.uploadUserPhoto,
//   userController.resizeUserPhoto,
//   userController.updateMe
// );

//router.delete('/deleteMe', userController.deleteMe);

router.use(restrictTo(['user','premium','master','admin']));

router
  .route('/')
  .get(getAllUsers)
  // .post(userController.createUser);

router
  .route('/:id')
  .get(getOneUser)
  // .patch(userController.updateUser)
  // .delete(userController.deleteUser);

export default router;