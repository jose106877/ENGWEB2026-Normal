const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Basic request logger
app.use((req, res, next) => {
  const d = new Date().toISOString().substring(0, 19);
  console.log(`${req.method} ${req.url} ${d}`);
  next();
});

const PORT = process.env.PORT || 19020;
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/readinglist";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB: connected."))
  .catch((err) => console.error("MongoDB error:", err));

const livroSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    autor: { type: String, required: true },
    paginas: { type: Number, required: true },
    genero: { type: String, required: true },
    lido: { type: Boolean, default: false },
  },
  {
    collection: "livros",
    versionKey: false,
  },
);

const Livro = mongoose.model("Livro", livroSchema);

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/livros?search=X
app.get("/api/livros", async (req, res) => {
  try {
    const search = req.query.search;
    let filter = {};

    if (search && search.trim()) {
      const regex = new RegExp(escapeRegExp(search.trim()), "i");
      filter = { $or: [{ titulo: regex }, { autor: regex }] };
    }

    const livros = await Livro.find(filter).exec();
    res.json(livros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/livros
app.post("/api/livros", async (req, res) => {
  try {
    const novo = new Livro(req.body);
    const saved = await novo.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/livros/:id (troca automaticamente estado lido)
app.put("/api/livros/:id", async (req, res) => {
  try {
    const livro = await Livro.findById(req.params.id).exec();
    if (!livro) return res.status(404).json({ error: "Not found" });

    livro.lido = !livro.lido;
    const updated = await livro.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Invalid id or server error" });
  }
});

// DELETE /api/livros/:id
app.delete("/api/livros/:id", async (req, res) => {
  try {
    const deleted = await Livro.findByIdAndDelete(req.params.id).exec();
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: "Invalid id or server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Reading List API em http://localhost:${PORT}`);
});
