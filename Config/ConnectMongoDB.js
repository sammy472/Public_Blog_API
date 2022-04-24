require('dotenv').config();
const mongoose = require('mongoose');
const connectMongoDB = async()=>{
    try{
        await mongoose.connect(process.env.URL);
        console.log('Successfully connected');
    }catch(e){
        console.log('An error occured',e);
    }
};
module.exports = connectMongoDB;
