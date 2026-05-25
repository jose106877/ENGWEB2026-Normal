const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const app = express();
app.use(express.json());

// Basic request logger
app.use((req, res, next) => {
  const d = new Date().toISOString().substring(0, 19);
  console.log(`${req.method} ${req.url} ${d}`);
  next();
});

const PORT = process.env.PORT || 17000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/jogostabuleiro";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB: connected."))
  .catch((err) => console.error("MongoDB error:", err));

const jogoSchema = new mongoose.Schema(
  {
    id: String,
  },
  {
    strict: false,
    collection: "jogos",
    versionKey: false,
    id: false,
  },
);
const Jogo = mongoose.model("Jogo", jogoSchema);

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildIdQuery(id) {
  const ors = [{ id }];
  if (mongoose.Types.ObjectId.isValid(id)) {
    ors.push({ _id: new mongoose.Types.ObjectId(id) });
  }
  return { $or: ors };
}

// Swagger UI
const swaggerPath = path.join(__dirname, "swagger.yaml");
const swaggerDoc = YAML.load(swaggerPath);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// GET /jogos
app.get("/jogos", async (req, res) => {
  try {
    const editora = req.query.editora;

    if (editora) {
      const regex = new RegExp(`^${escapeRegExp(editora)}$`, "i");
      const jogos = await Jogo.find(
        { "editoras.name": regex },
        { id: 1, name: 1, year: 1 },
      ).exec();
      return res.json(jogos);
    }

    const jogos = await Jogo.find(
      {},
      {
        id: 1,
        name: 1,
        year: 1,
        category: 1,
        minPlayers: 1,
      },
    ).exec();
    res.json(jogos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /jogos/:id
app.get("/jogos/:id", async (req, res) => {
  try {
    const jogo = await Jogo.findOne(buildIdQuery(req.params.id)).exec();
    if (!jogo) return res.status(404).json({ error: "Not found" });
    res.json(jogo);
  } catch (err) {
    res.status(400).json({ error: "Invalid id or server error" });
  }
});

// POST /jogos
app.post("/jogos", async (req, res) => {
  try {
    const novo = new Jogo(req.body);
    const saved = await novo.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /jogos/:id
app.delete("/jogos/:id", async (req, res) => {
  try {
    const deleted = await Jogo.findOneAndDelete(
      buildIdQuery(req.params.id),
    ).exec();
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /jogos/:id
app.put("/jogos/:id", async (req, res) => {
  try {
    const updated = await Jogo.findOneAndUpdate(
      buildIdQuery(req.params.id),
      req.body,
      { new: true },
    ).exec();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /autores
app.get("/autores", async (req, res) => {
  try {
    const autores = await Jogo.aggregate([
      { $unwind: "$autores" },
      {
        $group: {
          _id: "$autores.name",
          jogos: {
            $addToSet: {
              id: { $ifNull: ["$id", "$_id"] },
              name: "$name",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          autor: "$_id",
          jogos: 1,
        },
      },
    ]).exec();
    res.json(autores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /categorias
app.get("/categorias", async (req, res) => {
  try {
    const categorias = await Jogo.aggregate([
      {
        $group: {
          _id: "$category",
          jogos: {
            $push: {
              id: { $ifNull: ["$id", "$_id"] },
              name: "$name",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          categoria: "$_id",
          jogos: 1,
        },
      },
    ]).exec();
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API jogos em http://localhost:${PORT}`);
});
