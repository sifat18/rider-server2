require('dotenv').config();
const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');
const port = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dimib.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('heroRiders');
        const riderCollection = database.collection('riders');
        const driveCollection = database.collection('drive');

        app.post('/rider', async (req, res) => {
            const riderInfo = req.body.registerData;
            const drivingPic = req.files.drivingPic;
            const nidPic = req.files.nidPic;
            const profilePic = req.files.profilePic;
            const encodedDriving = drivingPic.data.toString('base64');
            const encodedNid = nidPic.data.toString('base64');
            const encodedProfile = profilePic.data.toString('base64');

            const drivingBuffer = Buffer.from(encodedDriving, 'base64');
            const nidBuffer = Buffer.from(encodedNid, 'base64');
            const profileBuffer = Buffer.from(encodedProfile, 'base64');
            const rider = {
                riderInfo,
                imageDriver: drivingBuffer,
                imageNid: nidBuffer,
                imageProfile: profileBuffer,

            }
            const result = await riderCollection.insertOne(rider);

            // console.log('body', req.body);            // const name = req.body.name;
            // console.log('files', req.files);
            res.json(result)            // const name = req.body.name;
            // const email = req.body.email;
            // const pic = req.files.image;
            // const picData = pic.data;
            // const encodedPic = picData.toString('base64');
            // const imageBuffer = Buffer.from(encodedPic, 'base64');
            // const doctor = {
            //     name,
            //     email,
            //     image: imageBuffer
            // }
            // res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Doctors portal!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})
