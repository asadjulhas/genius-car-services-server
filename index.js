const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb')
;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f89pm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const geniusCarCollection = client.db("geniusCar").collection("services");

    // Get all services
    app.get('/services', async (req, res) => {
      const query = {};
      const cursor = geniusCarCollection.find(query);
      const services = await cursor.toArray();
      res.send(services)
    })

    // Get single services
    app.get('/service/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const service = await geniusCarCollection.findOne(query);
      console.log(service);
      res.send(service)
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