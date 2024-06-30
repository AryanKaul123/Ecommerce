const Order=require("../models/orderModels");
const Product=require("../models/productModel");
const ErrorHandler=require("../middleware/auth");
const catchAsyncError=require("../middleware/catchAsyncError");

//new Order

const newOrder=catchAsyncError(async(req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
       
        paymentInfo,
        paidAt,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        
      } = req.body;

      const order=await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        paidAt,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id   

      });

      res.status(201).json({
        message:"succesfully created",
        success:true,
        order,
      });
  
});

//single order
const getSingleOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id; // Assuming you pass the order ID as a route parameter named "id"

    // Find the order by its ID
    const order = await Order.findById(orderId).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
        success:false,
     })
  }
};

//get logged in users showed their orders

const myOrders = async (req, res, next) => {
    try {
    // Assuming you pass the order ID as a route parameter named "id"
  
      // Find the order by its ID

      
      const orders = await Order.find({user:req.user._id});
      
  
     
  
      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
     res.status(500).json({
        success:false,
        message:error.message
     });
    }
  };

  //get all orders--Admin
  const getAllOrders=catchAsyncError(async(req,res,next)=>{
    const orders = await Order.find();
   let totalAmount=0
   orders.forEach((order)=>{
    totalAmount+=order.totalPrice
   })

    res.status(200).json({
        success:true,
        orders,
        totalAmount,
    });
  });

  //update order status---Admin
  const updateOrder=catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
  
    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }
  
    if (order.orderStatus === "Delivered") {
      return next(new ErrorHandler("You have already delivered this order", 400));
    }
  
    if (req.body.status === "Shipped") {
      order.orderItems.forEach(async (o) => {
        await updateStock(o.product, o.quantity);
      });
    }
    order.orderStatus = req.body.status;
  
    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }
  
    await order.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  });

//delete order--admin

const DeleteOrder=catchAsyncError(async(req,res,next)=>{
const order=await Order.findById(req.params.id)

if(!order){
  return next(new ErrorHandler("Order not found",404));
}
  
 await order.remove();

res.status(200).json({
  success:true,
  message:"order deleted succesfully",

})

})
 






  async function updateStock(id, quantity) {
    const product = await Product.findById(id);
  
    product.Stock -= quantity;
  
    await product.save({ validateBeforeSave: false });
  }








module.exports={newOrder,getSingleOrder,myOrders,getAllOrders,updateOrder,DeleteOrder};