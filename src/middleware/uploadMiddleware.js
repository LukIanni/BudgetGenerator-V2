const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: './src/public/uploads/',
    filename: function(req, file, cb){
        const filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        console.log('📸 [MULTER] Arquivo será salvo como:', filename);
        cb(null, filename);
    }
});

// Check file type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif|webp/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    console.log('📸 [MULTER] Validando arquivo:');
    console.log('  - Nome:', file.originalname);
    console.log('  - MIME Type:', file.mimetype);
    console.log('  - Extensão válida:', extname);
    console.log('  - MIME válido:', mimetype);

    if(mimetype && extname){
        console.log('✅ [MULTER] Arquivo validado com sucesso!');
        return cb(null, true);
    } else {
        console.error('❌ [MULTER] Tipo de arquivo inválido');
        cb('Erro: Apenas imagens são permitidas!');
    }
}

// Init upload
const upload = multer({
    storage: storage,
    limits: {fileSize: 5000000}, // 5MB limit
    fileFilter: function(req, file, cb){
        console.log('📸 [MULTER] Iniciando upload...');
        checkFileType(file, cb);
    }
}).single('profilePhoto'); // 'profilePhoto' is the name of the form field

module.exports = upload;
