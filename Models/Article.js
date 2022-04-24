const mongoose = require('mongoose');
const objectID = mongoose.Schema.Types.ObjectId;
const commentSchema = new mongoose.Schema({
    articleId:{
        type:objectID,//ID of the article
        required:[true,'It"s required please.'],
        ref:'Article',
    },
    commentorId:{
        type:objectID,//ID of the commentor or the user
        required:[true,'It"s required please.'],
        ref:'User',
    },
    comment:{
        type:String,
        required:[true,'It"s required please.'],
    }

},{timestamps:true});
const articleSchema = new mongoose.Schema({
    createdById:{
        type:objectID,//The id of the user who is creating this article
        ref:'User',
    },
    author:{
        type:String,//username of the user creating this article
        required:true,
        trim:true
    },
    category:{
        type:String,
        enum:{
            values:['Food','Sports','Education','Self Development','Finance/Business','Computer Science','Marketing','Engineering','Health','Tourism','Politics'],
            message:'{VALUE} not accepted.'
        },trim:true
    },
    topic:{
        type:String,
        required:true,
        trim:true,
        min:[2,'Must be at least 2 characters.Got {VALUE}.'],
        max:[50,'Must be at most 50 characters.Got {VALUE}.']
    },
    body:{
        type:String,
        required:true,
        trim:true,
        min:[2,'Must be at least 2 characters.Got {VALUE}.'],
    },
    avatar:{
        type:String,//the avatar of the user who is creating this article
        required:true,
        trim:true,
        default:'avata.png',
    },
    thumbnail:{
        type:String,
        required:true,
    },
    likes:[objectID],
    comments:{
        type:[commentSchema],
        required:false,
    }
},{timestamps:true});
const Article = mongoose.model('Article',articleSchema);
module.exports = Article;
