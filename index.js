const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const morgan = require("morgan");

app.use(morgan("dev"));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = require("./db");

app.listen(port, () =>
  console.log(`Server listening on port http://localhost:${port}`)
);

app.get("/", async (req, res) => {
  res.send("Hello World!");
});

//Get /books -> return all books
app.get("/books", async (req, res) => {
  try {
    const books = await pool.query("SELECT * FROM books");
    res.status(200).json({ message: "Books retrieved", data: books.rows });
  } catch (error) {
    res.json({ error: error.message });
  }
});

//Get /books/:id -> return book with id
app.get("/books/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const book = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
    res.status(200).json({ message: "Book retrieved", data: book.rows[0] });
  } catch (error) {
    res.json({ error: error.message });
  }
});

//Post /books -> create a book
app.post("/books", async (req, res) => {
  try {
    const id = uuidv4();
    const { name, description } = req.body;
    //inserting book data into db
    const newBook = await pool.query(
      "INSERT INTO books (id, name, description) VALUES ($1, $2, $3) RETURNING *",
      [id, name, description]
    );
    res.status(201).json({ message: "Book created", data: newBook.rows });
  } catch (error) {
    res.json({ error: error.message });
  }
});

//Put /books/:id -> update a book
app.patch("/books/:id", async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;
  try {
    const existingBook = await pool.query("SELECT * FROM books WHERE id = $1", [
      id,
    ]);

    if (existingBook.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    const updatedFields = { ...existingBook.rows[0], ...updateFields };

    const { name, description } = updatedFields;

    const updatedBook = await pool.query(
      "UPDATE books SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );

    res
      .status(200)
      .json({ message: "Book updated", data: updatedBook.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Delete /books/:id
app.delete("/books/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedBook = await pool.query(
      "DELETE FROM books WHERE id = $1 RETURNING *",
      [id]
    );
    res
      .status(200)
      .json({ message: "Book deleted", data: deletedBook.rows[0] });
  } catch (error) {
    res.json({ error: error.message });
  }
});
