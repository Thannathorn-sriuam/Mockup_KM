// const express = require('express');
// const multer = require('multer');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const path = require('path');
// const fs = require('fs');
// const extractText = require('./utils/extractText'); // <== เพิ่มบรรทัดนี้

// const app = express();

// // ตั้งค่าอัปโหลดไฟล์
// const storage = multer.diskStorage({
//   destination: './uploads',
//   filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
// });
// const upload = multer({ storage });

// app.use(cors());
// app.use(express.static('public'));

// // เชื่อม MongoDB
// mongoose.connect(connect_mongodb)
//   .then(() => console.log('✅ Connected to MongoDB'))
//   .catch(err => console.error('❌ MongoDB Error:', err));

// // สร้าง schema เก็บข้อมูลไฟล์
// const FileModel = mongoose.model('File', new mongoose.Schema({
//   filename: String,
//   originalname: String,
//   uploadDate: { type: Date, default: Date.now },
//   extractedText: String  // เพิ่ม field สำหรับข้อความที่แปลง
// }));

// // route อัปโหลด
// app.post('/upload', upload.single('file'), async (req, res) => {
//   if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

//   const filePath = path.join(__dirname, 'uploads', req.file.filename);

//   try {
//     const text = await extractText(filePath); // เรียกฟังก์ชันแปลงข้อความ

//     // บันทึกลง MongoDB พร้อม text ที่แปลงได้
//     const savedFile = await FileModel.create({
//       filename: req.file.filename,
//       originalname: req.file.originalname,
//       extractedText: text
//     });

//     res.json({
//       message: '✅ File uploaded and text extracted',
//       extractedText: text,
//       file: savedFile
//     });
//   } catch (error) {
//     console.error('❌ Failed to extract text:', error);
//     res.status(500).json({ message: '❌ Failed to extract text', error: error.message });
//   }
// });

// app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));

// backend/server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const extractText = require('./utils/extractText');
const { createEmbedding } = require('./services/embedding');
require('dotenv').config();

const app = express();

// ตั้งค่าอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

app.use(cors());
app.use(express.static('public'));

// เชื่อม MongoDB
mongoose.connect(process.env.connect_mongodb)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// สร้าง schema เก็บข้อมูลไฟล์
const FileModel = mongoose.model('File', new mongoose.Schema({
  filename: String,
  originalname: String,
  uploadDate: { type: Date, default: Date.now },
  extractedText: String,
  embedding: [Number]
}));

// route อัปโหลด
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const filePath = path.join(__dirname, 'uploads', req.file.filename);

  try {
    const text = await extractText(filePath);
    const embedding = await createEmbedding(text);

    const savedFile = await FileModel.create({
      filename: req.file.filename,
      originalname: req.file.originalname,
      extractedText: text,
      embedding
    });

    res.json({
      message: '✅ File uploaded, text extracted and embedded',
      file: savedFile
    });
  } catch (error) {
    console.error('❌ Failed:', error);
    res.status(500).json({ message: '❌ Failed to process file', error: error.message });
  }
});

app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));
