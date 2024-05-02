const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rz0kihv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
    const database = client.db("carDoctor");
    const serviceCollection = database.collection("services");
    const orderCollection = database.collection("order");

    app.get("/services", async(req, res) => {
        const cursor = serviceCollection.find();
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get("/services/:id", async(req, res) => {
          const id = req.params.id
          const query = { _id: new ObjectId(id) };
          const result = await serviceCollection.findOne(query);
          res.send(result)
    })

    app.get("/orders", async(req, res) => {
      const cursor = orderCollection.find();
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post("/orders", async(req, res) => {
      const order = req.body
      const result = await orderCollection.insertOne(order);
      res.send(result)
  }) 

  

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!")
    app.get("/", (req, res) => {
        res.send("Car Doctor Sarver")
    })

    
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);