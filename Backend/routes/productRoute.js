const express=require("express");

const router=express.Router();
const productController=require("../Controllers/productController");
const { IsAuthenticatedUser, authorizedRoles } = require('../middleware/auth');

router.get("/products",IsAuthenticatedUser,authorizedRoles("admin"),productController.getallProduct);
router.post("/admin/products/new",IsAuthenticatedUser,authorizedRoles("admin"),productController.createProduct);
router.put("admin/products/:id",IsAuthenticatedUser,productController.updateProduct);
router.delete("admin/products/:id",IsAuthenticatedUser,productController.deleteProduct);
router.get("/products/:id",productController.getProductDetails);
router.get("/reviews",productController.getProductReviews);
router.delete("/reviews",IsAuthenticatedUser,productController.DeleteReviews);
router.put("/review",IsAuthenticatedUser,productController.createProductReview);
module.exports=router;