const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json())

const dbPath = path.join(__dirname,"goodreads.db");

let db = null;

const initializeServerAndDb = async (req,res)=>{
  try {
    db = await open({
      filename : dbPath,
      driver : sqlite3.Database
    })
    app.listen(3005,()=>{
      console.log("Server started at port 3005")
    })
    
  } catch (error) {
    console.log(error.message);
    process.exit(1)
  }
}

initializeServerAndDb();

//GET books API
app.get("/books", async(req,res)=>{
  const getBooksQuery = `
    SELECT * FROM book ORDER BY book_id;
  `;

  const booksArray = await db.all(getBooksQuery);
  res.send(booksArray);
})

//GET book API
app.get("/books/:bookId", async(req,res)=>{
  const {bookId} = req.params;
  const getBookQuery = `
    SELECT * FROM book WHERE book_id = ${bookId};
  `;

  const book = await db.get(getBookQuery);
  res.send(book);
})

//GET author API
app.get("/author", async(req,res)=>{
  const getAuthQuery = `
    SELECT * FROM author ORDER BY author_id;
  `;

  const authArray = await db.all(getAuthQuery);
  res.send(authArray);
})

//POST book API
app.post("/books/", async (request, response) => {
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = request.body;

  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;

  const dbResponse = await db.run(addBookQuery);
  response.send("Book Added SuccessFully");
});

//PUT book API 
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price=${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;
  await db.run(updateBookQuery);
  response.send("Book Updated Successfully");
});

//DELETE book API 
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const deleteBookQuery = `
    DELETE FROM
      book
    WHERE
      book_id = ${bookId};`;
  await db.run(deleteBookQuery);
  response.send("Book Deleted Successfully");
});

app.get("/authors/:authorId/books/", async (request, response) => {
  const { authorId } = request.params;
  const getAuthorBooksQuery = `
    SELECT
     *
    FROM
     book
    WHERE
      author_id = ${authorId};`;
  const booksArray = await db.all(getAuthorBooksQuery);
  response.send(booksArray);
});