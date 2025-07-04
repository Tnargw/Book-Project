document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.getElementById("book-list");

  // Load finishedBooks from localStorage
  const booksJSON = localStorage.getItem("finishedBooks");
  if (booksJSON) {
    const books = JSON.parse(booksJSON);

    books.forEach(book => {
      const link = document.createElement("a");
      link.textContent = book.title;
      link.href = `library.html?id=${encodeURIComponent(book.id)}`;
      listContainer.appendChild(link);
    });
  } else {
    listContainer.textContent = "No books found.";
  }

  // Check for ?id=... in URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");
  if (bookId) {
    openModal(bookId);
  }
});

function openModal(bookId) {
  const modal = document.getElementById("bookModal");
  const modalBody = document.getElementById("modal-body");

  modalBody.innerHTML = "<p>Loading...</p>";

  fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
    .then(response => response.json())
    .then(data => {
      modalBody.innerHTML = `
        <h2>${data.volumeInfo.title}</h2>
        <p><strong>Authors:</strong> ${data.volumeInfo.authors?.join(", ") || "N/A"}</p>
        <p><strong>Page Count:</strong> ${data.volumeInfo.pageCount || "N/A"}</p>
        <p>${data.volumeInfo.description || "No description available."}</p>
        ${data.volumeInfo.imageLinks?.thumbnail
          ? `<img src="${data.volumeInfo.imageLinks.thumbnail}" alt="Book cover" />`
          : ""}
      `;
    })
    .catch(err => {
      modalBody.innerHTML = `<p>Error loading book details.</p>`;
      console.error(err);
    });

  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("bookModal").style.display = "none";

  // Remove id param from URL without reloading page
  const url = new URL(window.location);
  url.searchParams.delete("id");
  window.history.replaceState({}, document.title, url.pathname);
}

window.onclick = function(event) {
  const modal = document.getElementById("bookModal");
  if (event.target === modal) {
    closeModal();
  }
};
