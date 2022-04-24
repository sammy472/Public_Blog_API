const mongoose = require('mongoose');
const {isEmail } = require('validator');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,'Enter a username'],
        unique:false,
        trim:true,
        min:[6,'Must be at least 6.Got {VALUE}'],
        max:[20,'Must be at most 20.Got {VALUE}']
    },
    email:{
        type:String,
        required:[true,'Enter an email'],
        unique:true,
        validate:{
            validator:function(email){return isEmail(email)},
        },
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        unique:true,
        required:true,
        max:[100,'Must be at most 100.Got {VALUE}'],
        min:[5,'Must be at least 5.Got {VALUE}']
    },
    avatar:{
        type:String,
        required:false,
        unique:false,
        default:'avatar.png'
    },
    articles:{
        type:[mongoose.Schema.Types.ObjectId],//string of IDs of articles created by this user
        ref:'Article',
    },
    followers:{
        type:[mongoose.Schema.Types.ObjectId],//string of IDs of other users or authors a user follows
        ref:'User',
    },
    following:{
        type:[mongoose.Schema.Types.ObjectId],//string of IDs of authors or users following you
        ref:'User',
    }
},{timestamps:true});
userSchema.methods.validPassword = async(password)=>{
    return await bcrypt.compare(password,this.password);
};  
const User = mongoose.model('User',userSchema);
module.exports = User;
