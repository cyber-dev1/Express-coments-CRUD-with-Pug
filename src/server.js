const express = require("express");
const path = require("node:path");
const fs = require("fs/promises");

const app = express();

app.use(express.json());
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(process.cwd(), "public")));

const dbPath = (filename) => path.join(process.cwd(), "db", filename);

app.get("/", async (req, res) => {
    const data = await fs.readFile(dbPath("coment.json"), "utf8");
    const coments = JSON.parse(data);
    res.render("index", { coments: coments });
});

app.get("/coments", async (req, res) => {
    const data = await fs.readFile(dbPath("coment.json"), "utf8");
    const coments = JSON.parse(data);
    res.json(coments);
});

app.post("/coments/create", async (req, res) => {
    let data = await fs.readFile(dbPath("coment.json"), "utf8");
    data = JSON.parse(data);
    const { text } = req.body;
    const newComent = {
        text,
        id: data.length ? data.at(-1).id + 1 : 1
    };
    data.push(newComent);
    await fs.writeFile(dbPath("coment.json"), JSON.stringify(data, null, 4));
    res.status(201).json({ message: "Created", status: 201 });
});

app.put("/coments/edit/:id", async (req, res) => {
  const data = await fs.readFile(dbPath("coment.json"), "utf8");
  const coments = JSON.parse(data);

  const {text } = req.body;
  let id = req.params.id
  const idx = coments.findIndex((c) => c.id == id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });

  coments[idx].text = text;
  await fs.writeFile(dbPath("coment.json"), JSON.stringify(coments, null, 4));
  res.json({ message: "Updated", status: 200 });
});

app.delete("/coments/delete/:id", async (req, res) => {
    const data = await fs.readFile(dbPath("coment.json"), "utf8");
    const coments = JSON.parse(data);

    const id = req.params.id;
    const idx = coments.findIndex((c) => c.id == id);
    if (idx === -1) return res.status(404).json({ message: "Not found" });

    coments.splice(idx, 1);
    await fs.writeFile(dbPath("coment.json"), JSON.stringify(coments, null, 4));
    res.json({ message: "Deleted", status: 200 });
});

app.listen(7000, () => {
    console.log("Server is running on port 7000");
});
