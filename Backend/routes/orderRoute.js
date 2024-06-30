const express=require("express");
const router=express.Router();

const { IsAuthenticatedUser, authorizedRoles } = require('../middleware/auth');
const orderController=require("../Controllers/orderController");

router.post("/order/new",IsAuthenticatedUser,orderController.newOrder);
router.get("/order/:id",IsAuthenticatedUser,authorizedRoles("admin"),orderController.getSingleOrder)
router.get("/orders/me",IsAuthenticatedUser,orderController.myOrders);
router.get("/admin/orders",IsAuthenticatedUser,authorizedRoles("admin"),orderController.getAllOrders);
router.put("/admin/order/:id",IsAuthenticatedUser,authorizedRoles("admin"),orderController.updateOrder);

router.delete("/admin/order/:id",IsAuthenticatedUser,authorizedRoles("admin"),orderController.DeleteOrder);




module.exports=router;