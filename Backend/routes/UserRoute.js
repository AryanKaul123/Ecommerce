const express=require("express");
const userController=require("../Controllers/userController");
const { IsAuthenticatedUser, authorizedRoles } = require('../middleware/auth');


const router=express.Router();


router.post("/register",userController.registerUser);
router.post("/login",userController.login);
router.get("/logout",userController.logout);
router.post("/password/forgot",userController.forgotPassword);
router.put("/password/reset/:token",userController.resetPassword);
router.get("/me",IsAuthenticatedUser,userController.getuserDetails);
router.put("/password/update",IsAuthenticatedUser,userController.updatePassword)
router.put("/me/update",IsAuthenticatedUser,userController.updateProfile);
router.get("/getusers",IsAuthenticatedUser,authorizedRoles("admin"),userController.getallUsers);

router.get("/users/:id",IsAuthenticatedUser,authorizedRoles("admin"),userController.getSingleUserDetails);
router.put("/admin/updateuser/:id",IsAuthenticatedUser,authorizedRoles("admin"),userController.updateUserrole);
router.delete("/admin/delete/:id",IsAuthenticatedUser,authorizedRoles("admin"),userController.DeleteUser);
module.exports=router;