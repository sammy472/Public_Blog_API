require('../index');
const localStrategy = require('passport-local').Strategy;
const User = require('../Models/User')

module.exports = (passport)=>{
    passport.use(new localStrategy(async(username,password,done)=>{
        const user = await User.findOne({username});
        if(!user ){
            return done('user does not exist',false);
        }else if(!user.validPassword(password)){
            return done('Password is incorrect',false)
        }else{
            return done(null,user);
        };
    }));
    passport.serializeUser((user,done)=>{
        done(null,user._id);
    });
    passport.deserializeUser((id, cb)=>{
        User.findById(id,(err, user)=>{
            if (err) { return cb(err); }
            cb(null, user);
        });
    });    
};