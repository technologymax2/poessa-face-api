const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // .env ፋይልን ለመጠቀም
const Pensioner = require('./models/livenessSchema');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// የ MongoDB ግንኙነትን ከ Environment Variable ወይም ከ Localhost ጋር ማስተካከል
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/poessa';

mongoose.connect(dbURI)
  .then(() => console.log('MongoDB በተሳካ ሁኔታ ተገናኝቷል'))
  .catch(err => console.error('MongoDB ግንኙነት ተቋርጧል:', err));

app.post('/register', async (req, res) => {
    try {
        const newPensioner = new Pensioner(req.body);
        await newPensioner.save();
        res.json({ message: "ተመዝግቧል" });
    } catch (err) {
        res.status(500).json({ error: "መመዝገብ አልተቻለም" });
    }
});

app.get('/pending', async (req, res) => {
    try {
        // የスキーマ ስም verificationStatus ስለሆነ እሱን ተጠቀም
        const data = await Pensioner.find({ verificationStatus: 'Pending' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "መረጃ ማምጣት አልተቻለም" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));