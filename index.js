const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb')
;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f89pm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const geniusCarCollection = client.db("geniusCar").collection("services");

    app.get('/services', async (req, res) => {
      const query = {};
      const cursor = geniusCarCollection.find(query);
      const services = await cursor.toArray();
      res.send(services)
    })

  }
  finally {
    // await client.close();
  }

}
run().catch(console.dir)

app.get('/', (req, res) =>{
  res.send('Hello genius-car-services')
})

app.listen(port, () => {
  console.log(`Open genius-car-services server on port ${port}`)
})