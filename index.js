/*Import all required modules*/
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8000;
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const connectMongoDB = require('./Config/ConnectMongoDB');
const router = require('./Routes/Routes');
const passport = require('./Config/Passport')(require('passport'));

/*configure middlewares*/
app.use(express.static(__dirname+'/Public'))
app.use(cookieParser({secret: ' some secret'}))
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser({extended:true,}));
app.use(sessions({
    saveUninitialized: false,
    resave:false,
    secret: 'some secret',
    cookie:{httpOnly:true}
}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use('/api',router);
connectMongoDB();
app.listen(PORT,()=>{
    console.log(`Server is listening on PORT ${PORT}`);
})
