const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

app.use(cors({
    origin:['https://car-doctor-42352.web.app'],
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())

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
    // await client.connect();

    const verifyToken = (req, res, next) => {
      const token = req?.cookies?.token
      if(!token){
        return res.status(401).send({message : "unauthorise access"})
      }
      jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
          if(err){
            return res.status(401).send({message : "unauthorise access"})
          }
          req.user = decoded
          next()
      })

    }
    
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

    app.get("/orders",verifyToken, async(req, res) => {
      if(req.user.email !== req.query.email){
        return res.status(403).send({message : "forbidden access"})
      }

      let query = {}
      if(req.query.email){
        query = {customerEmail: req.query.email}
      }
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post("/jwt", (req, res) => {
        const user = req.body
        let token = jwt.sign( user, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
        res.cookie("token", token, {
          httpOnly:true,
          secure:true,
          sameSite: "none"
        })
        .send({success:true})
    })

    app.post('/signout', (req, res) => {
       res.clearCookie('token', {maxAge: 0})
       .send({success: true})
    })

    app.post("/orders", async(req, res) => {
      const order = req.body
      const result = await orderCollection.insertOne(order);
      res.send(result)
  }) 

   

   app.delete("/orders/:id", async(req, res) => {
       const id = req.params.id
       const query = { _id: new ObjectId(id) };
       const result = await orderCollection.deleteOne(query);
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