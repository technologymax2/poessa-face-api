const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Pensioner = require('./models/livenessSchema');
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

mongoose.connect('mongodb://localhost:27017/poessa');

app.post('/register', async (req, res) => {
    const newPensioner = new Pensioner(req.body);
    await newPensioner.save();
    res.json({ message: "ተመዝግቧል" });
});

app.get('/pending', async (req, res) => {
    const data = await Pensioner.find({ status: 'Pending' });
    res.json(data);
});

app.listen(5000, () => console.log('Server running on 5000'));