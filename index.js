const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

///firebase service acc
const admin = require("firebase-admin");
const serviceAccount = require("./learn-hub.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

//middleware
app.use(cors());
app.use(express.json());

//verify user
const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  try {
    const idToken = token.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    // ('decoded token', decoded);
    req.decoded_email = decoded.email;
    next();
  } catch (err) {
    (err);

    return res.status(401).send({ message: "unauthorized access" });
  }
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URI}
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
    app.get("/users", verifyFirebaseToken, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      user.role = "user";
      user.createdAt = new Date();
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "user exits" });
      } else {
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.send(result);
      }
    });
    app.get('/users/:email',verifyFirebaseToken, async (req, res) => {
      const email = req.params.email
      const query = { email }
      const result = await usersCollection.findOne(query)
      res.send(result)
    })
    app.delete("/users/:email", verifyFirebaseToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
    app.patch("/users/:email/role", verifyFirebaseToken, async (req, res) => {
      const email = req.params.email;
      const roleInfo = req.body;
      const query = { email };
      const updateDoc = {
        $set: {
          role: roleInfo.role,
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.patch("/users/:email", verifyFirebaseToken, async (req, res) => {
      const email = req.params.email;
      const updateData = req.body;
      const query = { email };

      // Build update document with $set operator
      const updateDoc = {
        $set: {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.photoURL && { photoURL: updateData.photoURL }),
          updatedAt: new Date()
        }
      };

      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.get("/users/:email/role", verifyFirebaseToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ role: user?.role || "user" });
    });

    /// course posting
    app.post("/create-course", verifyFirebaseToken, async (req, res) => {
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
      const courses = await courseCollection.find().toArray();
      res.send(courses);
    });

    //course by id
    app.get("/course/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await courseCollection.findOne(query);
      res.send(result);
    });

    //delete course by id
    app.delete("/course/:id", verifyFirebaseToken, async (req, res) => {
      const courseId = req.params.id;
      const query = { _id: new ObjectId(courseId) };
      const result = await courseCollection.deleteOne(query);
      const enrollmentResult = await enrollmentCollection.deleteMany({
        courseId: courseId,
      });
      res.send({
        courseDeleted: result.deletedCount,
        enrollmentsDeleted: enrollmentResult.deletedCount,
        message: "Course and related enrollments deleted successfully",
      });
    });

    ///course update
    app.patch("/course/:id", verifyFirebaseToken, async (req, res) => {
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
      const enrolled = await enrollmentCollection.findOne({ courseId, email });
      if (enrolled) {
        res.send({ message: "Already Enrolled" });
      } else {
        const result = await enrollmentCollection.insertOne(newEnrollment);
        res.send(result);
        // console.log("new enroll", result);
      }
    });
    ///enrollment get
    app.get("/enrollments", verifyFirebaseToken, async (req, res) => {
      const cursor = enrollmentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

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
