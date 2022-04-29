const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.420np.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

  try {

    await client.connect();
    const itemCollection = client.db('perfumeHouse').collection('items');
    app.get('/items', async (req,res) =>{
      const query = {};
      const cursor = itemCollection.find(query);
      const items= await cursor.toArray();
      res.send(items);
    })

  } finally {

    // await client.close();

  }

}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World! i am shariful')
})

app.listen(port, () => {
  console.log('Example app listening on port' ,port)
})