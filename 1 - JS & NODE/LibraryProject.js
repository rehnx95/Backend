function library() {
  let bookstore = [];
  let nextid = 1;

  return {
    addbook: function (title, author, pages) {
      let newbook = {
        title: title,
        author: author,
        pages: pages,
        id: nextid,
        borrowed: false,
      };
      bookstore.push(newbook);
      nextid = nextid + 1;
      return newbook;
    },

    getalltitles: function () {
      return bookstore.map((x) => x.title);
    },

    findbyauthor: function (author) {
      return bookstore.filter((x) => x.author === author);
    },

    totalpages: function () {
      return bookstore.reduce((acc, curr) => acc + curr.pages, 0);
    },

    foreachbook: function (callback) {
      for (let i = 0; i < bookstore.length; i++) {
        callback(bookstore[i]);
      }
    },

    applytobooks: function (logic) {
      let result = [];
      for (let i = 0; i < bookstore.length; i++) {
        result.push(logic(bookstore[i]));
      }
      return result;
    },

    checkAvailability: function (id) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let book = bookstore.find((x) => x.id === id);
          if (book === undefined) {
            reject(new Error(`Book with ID ${id} is not Available`));
          } else if (book.borrowed === true) {
            reject(new Error(`Book with ID ${id} is already Borrowed`));
          } else {
            resolve(book);
          }
        }, 1000);
      });
    },

    borrowbook: async function (id) {
      let bookborrowed = await this.checkAvailability(id);
      bookborrowed.borrowed = true;
      return bookborrowed;
    },

    returnbook: function (id) {
      let returningbook = bookstore.find((x) => x.id === id);
      if (returningbook) {
        returningbook.borrowed = false;
        return `Book ${id} returned successfully.`;
      }
      return "Book not found.";
    },

    borrowmultiple: async function (ids) {
      const multipleborrow = ids.map((id) => this.borrowbook(id));
      return await Promise.allSettled(multipleborrow);
    },
    removebook: function (id) {
      bookstore = bookstore.filter((x) => x.id !== id);
    },
  };
}

const logHistory = [];
function logger(book) {
  logHistory.push(
    `Book registered [ID: ${book.id}] - "${book.title}" by ${book.author} (${book.pages} pages)`,
  );
}

const myLib = library();

// test case by chatgpt

// ---- 1. addbook() ----
console.log("--- Adding books ---");
myLib.addbook("The Hobbit", "J.R.R. Tolkien", 310);
myLib.addbook("The Fellowship of the Ring", "J.R.R. Tolkien", 423);
myLib.addbook("Dune", "Frank Herbert", 412);
myLib.addbook("1984", "George Orwell", 328);
myLib.addbook("Animal Farm", "George Orwell", 112);

// ---- 2. getalltitles() ----
console.log("\n--- All titles ---");
console.log(myLib.getalltitles());

// ---- 3. findbyauthor() ----
console.log("\n--- Books by Tolkien ---");
console.log(myLib.findbyauthor("J.R.R. Tolkien"));

console.log("\n--- Books by Orwell ---");
console.log(myLib.findbyauthor("George Orwell"));

// ---- 4. totalpages() ----
console.log("\n--- Total pages across all books ---");
console.log(myLib.totalpages()); // 310+423+412+328+112 = 1585

// ---- 5. foreachbook() — wire in your logger here ----
console.log("\n--- Running logger over every book ---");
myLib.foreachbook(logger);
console.log(logHistory); // should now be filled, one entry per book

// ---- 6. applytobooks() — custom HOF ----
console.log("\n--- Custom logic: page count per book, as 'Title: N pages' ---");
const pageSummaries = myLib.applytobooks(
  (book) => `${book.title}: ${book.pages} pages`,
);
console.log(pageSummaries);

// ---- 7. checkAvailability() — direct test, before any borrowing ----
console.log("\n--- Checking availability of book id 1 (should succeed) ---");
myLib
  .checkAvailability(1)
  .then((book) => console.log("Available:", book))
  .catch((err) => console.log("Error:", err.message));

// ---- 8. borrowbook() — success case ----
setTimeout(() => {
  console.log("\n--- Borrowing book id 2 (should succeed) ---");
  myLib
    .borrowbook(2)
    .then((book) => console.log("Borrowed:", book))
    .catch((err) => console.log("Error:", err.message));
}, 1200); // delayed so it runs after the first checkAvailability above finishes

// ---- 9. borrowbook() — failure case: already borrowed ----
setTimeout(() => {
  console.log(
    "\n--- Trying to borrow book id 2 AGAIN (should fail — already borrowed) ---",
  );
  myLib
    .borrowbook(2)
    .then((book) => console.log("Borrowed:", book))
    .catch((err) => console.log("Error:", err.message));
}, 2500);

// ---- 10. borrowbook() — failure case: book doesn't exist ----
setTimeout(() => {
  console.log(
    "\n--- Trying to borrow book id 999 (should fail — doesn't exist) ---",
  );
  myLib
    .borrowbook(999)
    .then((book) => console.log("Borrowed:", book))
    .catch((err) => console.log("Error:", err.message));
}, 3800);

// ---- 11. returnbook() ----
setTimeout(() => {
  console.log("\n--- Returning book id 2 ---");
  console.log(myLib.returnbook(2)); // "Book 2 returned successfully."
  console.log(myLib.returnbook(999)); // "Book not found."
}, 5000);

// ---- 12. borrowmultiple() — mix of valid and already-borrowed/nonexistent ids ----
setTimeout(() => {
  console.log("\n--- Borrowing multiple: ids [1, 3, 4, 999] ---");
  myLib.borrowmultiple([1, 3, 4, 999]).then((results) => {
    console.log("Settled results:");
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        console.log(`  id ${[1, 3, 4, 999][i]}: SUCCESS —`, r.value);
      } else {
        console.log(`  id ${[1, 3, 4, 999][i]}: FAILED —`, r.reason.message);
      }
    });
  });
}, 6200);

// ---- 13. this-binding test (Part 8) — the detached method trap ----
setTimeout(() => {
  console.log(
    "\n--- Testing detached borrowbook (should throw 'this.checkAvailability is not a function') ---",
  );
  const detachedBorrow = myLib.borrowbook;
  detachedBorrow(1)
    .then((r) => console.log(r))
    .catch((e) => console.log("Expected error:", e.message));
}, 8500);

// ---- 14. fixed version, using .bind() ----
setTimeout(() => {
  console.log("\n--- Same detached call, but FIXED with .bind(myLib) ---");
  const boundBorrow = myLib.borrowbook.bind(myLib);
  boundBorrow(1)
    .then((r) => console.log("Fixed, works now:", r))
    .catch((e) => console.log("Error:", e.message));
}, 9700);
