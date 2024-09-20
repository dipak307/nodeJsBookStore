const mongoose=require("mongoose");

let db=async()=>{

    await mongoose.connect(process.env.MONGODB_URL)
    .then(()=>console.log("mongodb connected.."))
    .catch((err)=>console.log("mongodb not connected",err));
}

module.exports=db;