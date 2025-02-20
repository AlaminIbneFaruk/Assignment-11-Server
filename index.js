const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 7000;

// Middleware
const allowedOrigins = ['http://localhost:5000','http://localhost:5174'];

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stnyf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let collection;
async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        const database = client.db("ArtifactBazaar");
        collection = database.collection("artifacts");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
}
app.get("/artifacts", async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  try {
      const artifacts = await collection.find().limit(limit).toArray();
      res.json(artifacts);
  } catch (error) {
      console.error("Fetch error:", error);
      res.status(500).json({ message: "Failed to fetch artifacts", error: error.message });
  }
});
app.get("/", (req, res) => res.send("Hello World!"));

connectDB().then(() => {
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
});
