const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        db = client.db("myDatabase"); // Replace with your database name
        collection = db.collection("myCollection"); // Replace with your collection name
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
}

app.get("/", (req, res) => res.send("Hello World!"));

connectDB().then(() => {
    app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
});
