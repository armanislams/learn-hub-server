const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xbf1ip3.mongodb.net/?appName=Cluster0
`; // Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    const db = client.db("learn-hub");
    const usersCollection = db.collection("users");
    const courseCollection = db.collection("courses");
    const enrollmentCollection = db.collection("enrollments");

    ///users
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "user exits" });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    /// course posting
    app.post("/create-course", async (req, res) => {
      const newCourse = req.body;
      const { title } = newCourse;
      const existingCourse = await courseCollection.findOne({ title });
      console.log(newCourse);

      if (existingCourse) {
        return res
          .status(409)
          .json({ message: "Course with this title already exists" });
      } else {
        const result = await courseCollection.insertOne(newCourse);
        res.send(result);
      }
    });

    //all course
    app.get("/course", async (req, res) => {
      const cursor = courseCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //course by id
    app.get("/course/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await courseCollection.findOne(query);
      res.send(result);
    });

    ///course update
    app.patch("/course/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCourse = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          title: updatedCourse.title,
          image: updatedCourse.image,
          price: updatedCourse.price,
          duration: updatedCourse.duration,
          category: updatedCourse.category,
          description: updatedCourse.description,
        },
      };
      const result = await courseCollection.updateOne(query, update);
      res.send(result);
    });

    ///enrollments post
    app.post("/enrollments", async (req, res) => {
      const { courseId, email } = req.body;
      const newEnrollment = {
        courseId,
        email,
        enrolledAt: new Date(),
      };
      const enrolled = await enrollmentCollection.findOne({courseId, email});
      if (enrolled) {
        res.send({ message: "Already Enrolled" });
      } else {
        const result = await enrollmentCollection.insertOne(newEnrollment);
          res.send(result)
        console.log('new enroll',result);
      }
    });
      ///enrollment get
      app.get("/enrollments", async (req, res) => {
const cursor = enrollmentCollection.find();
const result = await cursor.toArray();
res.send(result);
      })

      //enrollment check
       app.get("/enrollments/:courseId", async (req, res) => {
         const { courseId } = req.params;
         const { email } = req.query;

         try {
           const enrolled = await enrollmentCollection.findOne({
             courseId: courseId,
             email: email,
           });

           res.send({ enrolled: !!enrolled });
         } catch (err) {
           console.error(err);
           res.status(500).send({ error: "Server error" });
         }
       });
   

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("server running good");
});

app.listen(port, () => {
  console.log("server running on:", port);
});
