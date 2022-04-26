const express = require('express');
const app = express();
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb')
;
const { query } = require('express');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json())

function verifyJWT(req, res, next) {
  const AccessToken = req.headers.authorization;
  if(!AccessToken){
    return res.status(401).send({Message: 'unauthorized access'})
  }
  const token = AccessToken.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRETE_KEY, (err, decoded) => {
    if(err) {
      return res.status(403).send({message: 'Forbidden'})
    }
    req.decoded = decoded;
    next();
  }) 
  // console.log('User sended token by new', token);
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f89pm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const geniusCarCollection = client.db("geniusCar").collection("services");
    const orderCollection = client.db('geniusCar').collection('order');

    // Add service
    app.post('/service', async (req, res) => {
      const service = req.body;
      const results = await geniusCarCollection.insertOne(service);
      res.send(results)
    })

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
      res.send(service)
    })

    // Delete a service
    app.delete('/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = geniusCarCollection.deleteOne(query);
      res.send(result)
    })
    
    // Store order
    app.post('/order', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order)
      res.send(result)
    })

    // Get order list by user
    app.get('/order', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email
      const email = req.query.email;
      console.log(decodedEmail, email)
      if(decodedEmail === email) {
        const query = {email: email};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders)
      } else {
        res.status(403).send({message: 'forbidden access'})
      }
    })

    // Create JWT for user
    app.post('/login', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.JWT_SECRETE_KEY, {
        expiresIn: '1d'
      })
  res.send({accessToken})
    })

  }
  finally {
    // await client.close();
  }

}
run().catch(console.dir)

app.get('/', (req, res) =>{
  res.send('Hello genius-car-services Server')
})

app.listen(port, () => {
  console.log(`Open genius-car-services server on port ${port}`)
})