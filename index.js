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

app.get("/all-artifacts", async (req, res) => {
  try {
      const artifacts = await collection.find().toArray();
      res.json(artifacts);
  } catch (error) {
      console.error("Fetch error:", error);
      res.status(500).json({ message: "Failed to fetch artifacts", error: error.message });
  }
});

app.get("/myartifacts/:userid", async (req, res) => {
  const { userid } = req.params;
  try {
      const artifacts = await collection.find({ "addedBy.uid": userid }).toArray();
      if (!artifacts.length) return res.status(404).json({ message: "No artifacts found for this user." });
      res.json(artifacts);
  } catch (error) {
      console.error("Fetch error:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

app.get("/artifact-details/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid artifact ID" });
  
  try {
    const artifact = await collection.findOne({ _id: new ObjectId(id) });
    if (!artifact) return res.status(404).json({ message: "Artifact not found" });
    res.json(artifact);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Failed to fetch artifact", error: error.message });
  }
});

app.post("/add-artifact", async (req, res) => {
  const artifact = req.body;
  if (!artifact.artifactName || !artifact.addedBy) return res.status(400).json({ message: "Missing required fields" });

  try {
      const result = await collection.insertOne(artifact);
      res.status(201).json({ message: "Artifact added successfully", id: result.insertedId });
  } catch (error) {
      console.error("Insert error:", error);
      res.status(500).json({ message: "Failed to add artifact", error: error.message });
  }
});


app.put("/artifactupdate/:id", async (req, res) => {
  const { id } = req.params;
  const updatedArtifact = req.body; 
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid artifact ID" });


  if (!updatedArtifact.artifactName || !updatedArtifact.addedBy) {
      return res.status(400).json({ message: "Missing required fields" });
  }

  try {

      const { _id, ...updateData } = updatedArtifact;

      const result = await collection.updateOne(
          { _id: new ObjectId(id) }, 
          { $set: updateData } 
      );

      if (result.modifiedCount === 0) {
          return res.status(404).json({ message: "Artifact not found or no changes made" });
      }

      res.json({ message: "Artifact updated successfully" });
  } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ message: "Failed to update artifact", error: error.message });
  }
});

app.get("/", (req, res) => res.send("Hello World!"));

connectDB().then(() => {
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
});
