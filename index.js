const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECTET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' });
    }
    console.log('decoded', decoded);
    req.decoded = decoded;
    next();
  })

  
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.420np.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// console.log(uri);
async function run() {

  try {

    await client.connect();
    const itemCollection = client.db('perfumeHouse').collection('items');
    app.get('/items', async (req, res) => {
      const query = {};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });



    // console.log('all file are working');


    app.post('/login', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECTET, {
        expiresIn: '2d'
      });
      res.send({ accessToken })
    })

    app.get('/items/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const items = await itemCollection.findOne(query);
      res.send(items);
    });

    app.post('/items', async (req, res) => {
      const newItem = req.body;
      const result = await itemCollection.insertOne(newItem);
      req.send(result)
    });

    app.get('/item', verifyJwt, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = itemCollection.find(query);
        const items = await cursor.toArray();
        res.send(items)
      }
      else{
        res.status(403).send({message:'forbiden access'})
      }
    })

    app.delete('/items/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemCollection.deleteOne(query);
      res.send(result)
    });

  } finally {

    // await client.close();

  }

}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('server is Running')
})

app.listen(port, () => {
  console.log('Example app listening on port', port)
})