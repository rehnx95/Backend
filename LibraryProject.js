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
      const alltitles = bookstore.map((x) => x.title);
      return alltitles;
    },
    findbyauthor: function (author) {
      const authorbook = bookstore.find((x) => x.author === author);
      return authorbook;
    },
    totalpages: function () {
      const pages = bookstore.reduce((acc, curr) => {
        acc + curr.pages;
        return acc;
      }, 0);
      return pages;
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
            reject(new Error("Book is not Available"));
          } else if (book.borrowed === true) {
            reject(new Error("Book is already Borrowed"));
          } else {
            resolve(book);
          }
        }, 1000);
      });
    },
    borrowbook: async function (id) {
      try {
        let bookborrowed = await this.checkAvailability(id);
        bookborrowed.borrowed = true;
        return bookborrowed;
      } catch (err) {
        return err.message;
      }
    },
    returnbook: function (id) {
      let returningbook = bookstore.find((x) => x.id === id);
      if (returningbook !== undefined) {
        returningbook.borrowed = false;
      }
    },
  };
}
function logger(book) {
  let log = [];
  log.push(
    `Book registered [ID: ${book.id}] - "${book.title}" by ${book.author} (${book.pages} pages)`,
  );
}
