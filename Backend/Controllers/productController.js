const Product=require("../models/productModel");
const catchAsyncError=require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorhanlder");
const apifeatures=require("../utils/apifeatures")


//create product--admin 

const createProduct =  catchAsyncError(async (req, res) => {
  

    try {
        req.body.user=req.user.id;
        const product = await Product.create(req.body);

       
        res.status(201).json({
            success: true,
            product,
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
});


//get all products

const getallProduct= catchAsyncError(async(req,res,next)=>{
const resultperpage=5
const productCount=await Product.countDocuments();
   const apiFeature=new apifeatures(Product.find(),req.query).
   search().
   filter()
   .pagination(resultperpage);

    const products=await apiFeature.query;
    res.status(200).json({
        success: true,
            products,
            productCount,
        
    });
});
//update products--Admin
 const updateProduct=catchAsyncError(async(req,res,next)=>{
    console.log(req.params.id);
    let product=await Product.findById(req.params.id);
    console.log(product);
//validation 
if(!product){
    return  next(new ErrorHandler("Product not found",404));
}

   product=await Product.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
   });


     res.status(200).json({
        message:"Product updated",
        product,
     })

 });
 

 //Delete product--admin

 const deleteProduct=catchAsyncError(async(req,res,next)=>{
    const product=await Product.findByIdAndDelete(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

  

   res.status(200).json({
    success:true,
    message:"product deleted succesfully",
   });

 });

 //get product details
 const getProductDetails=catchAsyncError(async(req,res,next)=>{
    const product=await Product.findByIdAndDelete(req.params.id);

    if(!product){
        return res.status(500).json({
            message:"Product not found",
            "success":false,
        });
    }
    
    res.status(200).json({
        success:true,
       product,
       });

 });

 //create new review and update the review

 const createProductReview=catchAsyncError(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
  
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
  
    const product = await Product.findById(productId);
  
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
  
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
  
    let avg = 0;
  
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    product.ratings = avg / product.reviews.length;
  
    await product.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,

    });
  });

  //get all reviews of thhe given product
  const getProductReviews=catchAsyncError(async(req,res,next)=>{
    const product=await Product.findById(req.query.id);
   

    if(!product){
        return next(new ErrorHandler("the product not found",404));
    }
    res.status(200).json({
        succcess:true,
        reviews:product.reviews,
    })
  });

  //delete reviews

  const DeleteReviews=catchAsyncError(async(req,res,next)=>{
    const product=await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("the product not found",404));
    }

   const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.productId);




   let avg = 0;
  
   product.reviews.forEach((rev) => {
     avg += rev.rating;
   });


  const  ratings = avg / product.reviews.length;
  const numOfReviews=reviews.length;

  await Product.findByIdAndUpdate(req.query.productId,{
    reviews,
    ratings,
    numOfReviews
  },{
    new:true,
    runValidators:true,
    useFindAndModify:false,
  });


 

    res.status(200).json({
        succcess:true,
       
    }); 

  });














module.exports={getallProduct,createProduct,updateProduct,deleteProduct,getProductDetails,createProductReview,DeleteReviews,getProductReviews};