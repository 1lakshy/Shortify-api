const mongoose = require("mongoose");

let UrlSchema = new mongoose.Schema({
    originalUrl:{
        type:String,
        required:true
    },
    random:{
        type:String,
        required:true
    }
},{timestamps:true});

const URL = new mongoose.model("URL",UrlSchema)
module.exports = URL