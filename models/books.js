const mongoose=require("mongoose");

   const bookSchema=mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required:true
        },
         title:{
            type:String,
            required:true,
         },
         author:{
            type:String,
            required:true,
         },
         description:{
            type:String,
           
         },
         coverImage:{
            type:String,
           
         },
         price:{
            type:String,
            required:true,
         },
   },{timeStamps:true})


module.exports = mongoose.model("Book", bookSchema);


