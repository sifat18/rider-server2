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
        const userCollection = database.collection('users')

        // registering users for the first time
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log('success');
            // res.json(result);
        });

        //checking admin or not
        app.get('/user/:email', async (req, res) => {
            console.log('hitting admin check')
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            let Isadmin = false;
            if (result?.role == 'admin') {
                Isadmin = true
            }
            console.log('success');
            res.json({ admin: Isadmin });
        });
        app.get('/rider', async (req, res) => {

            const result = await riderCollection.find({})
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let riders;
            const count = await result.count();
            if (page) {
                riders = await result.skip(page * size).limit(size).toArray();
            }
            else {
                riders = await result.toArray();
            }
            res.send({ count, riders })
        })

        app.post('/rider', async (req, res) => {
            const riderInfo = JSON.parse(req.body.registerData);
            const name = riderInfo.name;
            const age = riderInfo.age;
            const email = riderInfo.email;
            const phone = riderInfo.phone;
            const drivingPic = req.files.drivingPic;
            const userType = 'rider';
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
                fullName: name,
                age: age,
                email: email,
                phone: phone,
                imageDriver: drivingBuffer,
                imageNid: nidBuffer,
                imageProfile: profileBuffer,
                userType: userType

            }
            const result = await riderCollection.insertOne(rider)
            res.json(result)
        })
        app.post('/driving', async (req, res) => {
            const driverInfo = JSON.parse(req.body.registerData);
            const name = driverInfo.name;
            const age = driverInfo.age;
            const email = driverInfo.email;
            const phone = driverInfo.phone;
            const nidPic = req.files.nidPic;
            const profilePic = req.files.profilePic;
            const userType = 'driving';
            const encodedNid = nidPic.data.toString('base64');
            const encodedProfile = profilePic.data.toString('base64');

            const nidBuffer = Buffer.from(encodedNid, 'base64');
            const profileBuffer = Buffer.from(encodedProfile, 'base64');
            const rider = {
                driverInfo,
                fullName: name,
                age: age,
                email: email,
                phone: phone,
                imageNid: nidBuffer,
                imageProfile: profileBuffer,
                userType: userType

            }
            const result = await driveCollection.insertOne(rider);
            console.log(result.insertedId);
            res.json(result)

        })
        app.get('/driver', async (req, res) => {

            const result = await driveCollection.find({})
            const driverData = await result.toArray()
            res.json(driverData)
        })
        app.put('/admin/:email', async (req, res) => {
            const user = req.params.email;
            const cursor = { email: user };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(cursor, updateDoc);
            console.log('success admin put', result)
            res.json(result)
        });

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello!!!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})
