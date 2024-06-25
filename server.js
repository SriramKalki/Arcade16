const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 30000000 }, // 30MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('myFile');

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

app.use(express.static('public'));

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      if (req.file == undefined) {
        res.status(400).send('Error: No File Selected!');
      } else {
        res.redirect(`/uploads/${req.file.filename}`);
      }
    }
  });
});

app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send('File not found');
    } else {
      res.sendFile(filePath);
    }
  });
});

app.get('/files', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      res.status(500).json({ message: 'Unable to retrieve files' });
    } else {
      res.json(files);
    }
  });
});

app.delete('/uploads/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        res.status(404).send('File not found');
      } else {
        res.sendStatus(200);
      }
    });
  });
  

app.listen(port, () => console.log(`Server started on port ${port}`));
