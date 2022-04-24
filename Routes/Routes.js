const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const Article = require('../Models/Article');
const passport = require('../Config/Passport');
const upload = require('../Config/Multer');
const bcrypt = require('bcrypt');
const ObjectId = require('mongoose').Schema.Types.ObjectId;


/******signup route handler******/
router.post('/signup',async(req,res)=>{
    const {username,email,password,} = req.body;
    const genSalt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,genSalt);
    try{
        const newUser = await User.create({
            username:username,
            email:email,
            password:hash,
            avatar:'sammy.jpeg',
        });
        res.status(200).json(newUser);
    }catch(e){
        res.status(500).json(e);
    }
});
/*******login route handler********/
router.post('/login',async(req,res)=>{
    const {username,password} = req.body;
    const user = await User.findOne({username});
    if(!user){
        return res.status(404).json({msg:'User not found'})
    }else if(!await bcrypt.compare(password,user.password)){
        return res.status(404).json({msg:'Incorrect password'})
    }else{
        return res.status(200).json(user);
    }
});
/*****all articles route handler******/
router.get('/all/articles',async(req,res)=>{
    try{
        const articles = await Article.find({});
        res.status(200).json(articles);
    }catch(e) {
        res.status(404).json(e);
    }
});
/******create an article route handler******/
router.post('/article/create/:createdById',async(req,res)=>{
    const {createdById} = req.params;
    const {category,topic,body,} = req.body;
    const user = await User.findById(createdById);
    if(user){
        await Article.create({
            createdById:createdById,
            author:user.username,
            category:category,
            topic:topic,
            body:body,
            avatar:user.avatar,
            thumbnail:'avatar.png',
        }).then(async(doc)=>{
            user.articles.push(doc._id);
            await user.save();
            res.status(200).json(doc);
        }).catch(e=>{
            res.status(500).json(e);
        });
    }else{
        return res.status(404).json('User not found');
    }
});
/******get a specific user's articles*******/
router.get('/articles/all/:userId',async(req,res)=>{
    const {userId} = req.params;
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json('User Not Found')
    }else{
        const articles = user.articles;
        await Article.find({_id:{$in:articles}})
        .then(docs=>{
            res.status(200).json(docs);
        }).catch(e=>{
            res.status(500).json(e);
        });
    }
});
/****delete an article******/
router.delete('/article/delete/:articleId/:userId',async(req,res)=>{
    try {
        const {articleId,userId} = req.params;
        const article = await Article.findById(articleId);
        if(article && String(article.createdById) === String(userId)){
            const deletedArticle = await Article.deleteOne({_id:article._id});
            await User.updateOne({_id:userId},{$pull:{articles:articleId}});
            return res.status(200).json(deletedArticle);
        }else{
            return res.status(403).json({msg:'You cannot delete this article',existNot:'User does not exist'});
        }
    } catch(e){
        res.status(500).json(e);
    }
});
/****Edit an article route hander******/
router.patch('/article/edit/:articleId/:userId',async(req,res)=>{
    const {articleId,userId} = req.params;
    const {category,topic,body} = req.body;
    const thumbnail = 'sammy.png';
    if(category || topic || body || thumbnail){
    try {
        const article = await Article.findById(articleId);
        if(String(article.createdById) === userId){
            if(category){
                await Article.updateOne({_id:article._id},{$set:{category:category}},{timestamps:{createAt:false,updatedAt:true}});
            }
            if(topic){
                await Article.updateOne({_id:article._id},{$set:{topic:topic}},{timestamps:{createAt:false,updatedAt:true}});
            }
            if(body){
                await Article.updateOne({_id:article._id},{$set:{body:body}},{timestamps:{createAt:false,updatedAt:true}});
            }
            if(thumbnail){
                await Article.updateOne({_id:article._id},{$set:{thumbnail:thumbnail}},{timestamps:{createAt:false,updatedAt:true}});
            }
            const updatedArticle = await Article.findOne({_id:article._id});
            return res.status(200).json(updatedArticle);
        }else{
            return res.status(403).json({msg:'You cannot update this article'});
        }
    } catch(e){
        res.status(500).json(e);
    }
    }
});
/*****follow an author or a user route handler******/;
router.patch('/author/follow/:masterId/:slaveId',async(req,res)=>{
const {masterId,slaveId} = req.params;
    try{
        if(masterId === slaveId){
            return res.status(403).json({msg:'You cannot follow yourself.'});
        }else{
            const master = await User.updateOne({_id:masterId},{$addToSet:{followers:slaveId}});
            const slave = await User.updateOne({_id:slaveId},{$addToSet:{following:masterId}});
            return res.status(200).json([master,slave]);
        }
    }catch(e){
        res.status(403).json(e);
    };
});
/*****unfollow an author or a user route handler******/;
router.patch('/author/unfollow/:masterId/:slaveId',async(req,res)=>{
    const {masterId,slaveId} = req.params;
    if(masterId && slaveId){
        try{
            const master = await User.updateOne({_id:masterId},{$pull:{followers:slaveId}});
            const slave = await User.updateOne({_id:slaveId},{$pull:{following:masterId}});
            res.status(200).json([master,slave]);
        }catch(e){
            res.status(403).json(e);
        }
    }else{
        return res.status(500).json('IDs do not exist');
    };
});

/******Like an article route handler******/
router.patch('/article/like/:articleId/:userId',async(req,res)=>{
    const {articleId,userId} = req.params;
    const article = await Article.findById(articleId);
    const whosId = article.likes.find(e=>String(e)==userId);
    if(!whosId){
        try{
            const doc = await Article.updateOne({_id:articleId},{$addToSet:{likes:userId}});
            const number = (await Article.findById(articleId,{likes:true})).likes.length;
            res.status(200).json([doc,number]);
        }catch(e){
            res.status(403).json(e);
        }
    }else{
        return res.status(403).json('You have already liked this article.');
    };
});
/******dislike an article route handler******/
router.patch('/article/dislike/:articleId/:userId',async(req,res)=>{
    const {articleId,userId} = req.params;
    const article = await Article.findById(articleId);
    const whosId = article.likes.find(e=>String(e)==userId);
    if(whosId){
        try{
            const doc = await Article.updateOne({_id:articleId},{$pull:{likes:userId}});
            const number = (await Article.findById(articleId,{likes:true})).likes.length;
            res.status(200).json([doc,number]);
        }catch(e){
            res.status(403).json(e);
        }
    }else{
        return res.status(403).json('You have not already liked this article.');
    };
});
/****get all followers route handler*****/
router.get('/follwers/:userId',async(req,res)=>{
    try{
        const {userId} = req.params;
        const user = await User.findById(userId);
        const followersId = user.followers;
        const followers = await User.find({_id:{$in:followersId}});
        res.status(200).json(followers);
    }catch(e){
        res.status(404).json(e);
    }
});
/****get all users you are following route handler*****/
router.get('/follwers/:userId',async(req,res)=>{
    try {
        const {userId} = req.params;
        const user = await User.findById(userId);
        const followingId = user.following;
        const following = await User.find({_id:{$in:followingId}});
        res.status(200).json(following);
    } catch (e) {
        res.status(404).json(e);
    }
});
/******post or create a comment route handler******/
router.post('/comment/create/:articleId/:userId',async(req,res)=>{
    const {articleId,userId} = req.params;
    const {comment} = req.body;
    if(comment){
        const data = {
            articleId:articleId,
            commentorId:userId,
            comment:comment,
        };
        const article = await Article.updateOne({_id:articleId},{$push:{comments:data}});
        res.status(200).json(article);
    }else{
        return res.status(403).json('Must provide the comment.');
    };
});
/*******edit a comment********/
router.patch('/comment/edit/:commentId',async(req,res)=>{
    const {commentId} = req.params;
    try{
        const {comment} = req.body;
        if(comment){
            const updatedComment = await Article.updateOne({"comments._id":commentId},{$set:{"comments.$.comment":comment}});
            return res.status(200).json(updatedComment);
        }else{
            return res.status(403).json('Comment box is empty.');
        }
    }catch(e){
        res.status(500).json(e);
    };
});
/*******delete a comment********/
router.delete('/comment/delete/:commentId/:commentorId/:articleId',async(req,res)=>{
    const {commentId,commentorId,articleId} = req.params;
    try{
        const article = await Article.findById(articleId);
        const match = article.comments.find(e=>String(e.commentorId) === commentorId);
        if(match && String(match.commentorId) === commentorId){
            const updatedComment = await Article.updateOne({_id:articleId},{$pull:{comments:{_id:commentId}}});
            return res.status(200).json(updatedComment);
        }else{
            return res.status(403).json('You are not authorized.');
        }
    }catch(e){
        res.status(500).json(e);
    };
});
module.exports = router;










