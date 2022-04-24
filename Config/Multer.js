const multer = require('multer');
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,__dirname+'/Public/Uploads/Thumbnails');
    },
    filename:(req,file,cb)=>{
        const name = file.fieldname + '-' + Date.now() + '.' + file.mimetype;
        cb(null,name);
    }
});
const upload = multer({
    storage,
    limits:{fileSize:3000000},
    fileFilter:null
});
module.exports = upload;