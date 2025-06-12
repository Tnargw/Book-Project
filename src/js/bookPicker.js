let selectedAudience = null;

function getAudience(age) {
    if (age <= 12) return "kids";
    if (age <= 16) return "ya";
    if (age <= 25) return "ya-language";
    return "no restrictions";
}

function chooseAge() {
    const age = parseInt(document.getElementById("ageInput").value);
    if (!age) return alert("Please enter your age");

    selectedAudience = getAudience(age);
    const audienceData = filledBooks[selectedAudience];

    const categoryContainer = document.getElementById("categories");
    categoryContainer.innerHTML = "";

    Object.keys(audienceData).forEach(genre => {
        const button = document.createElement("button");
        button.textContent = genre;
        button.className = "category-button";
        button.addEventListener("click", () => {
            loadCategory(genre);
        });
        categoryContainer.appendChild(button);
    });

    document.getElementById("books").innerHTML = "";
}

function loadCategory(genre) {
    const books = filledBooks[selectedAudience][genre];
    const container = document.getElementById("books");
    container.innerHTML = "";

    books.forEach(book => {
        try {
            const info = book.items[0].volumeInfo;
            const title = info.title || "No Title";
            const img = info.imageLinks?.thumbnail || "";

            const card = document.createElement("div");
            card.className = "book-card";
            card.dataset.title = title;

            card.innerHTML = `
                <img src="${img}" alt="${title}">
                <div class="book-title">${title}</div>
            `;

            card.addEventListener('click', () => {
                card.classList.toggle('selected');
            });

            container.appendChild(card);
        } catch (e) {
            console.log("Skipping book (missing data)", e);
        }
    });
}

function submitQuiz() {
    const selectedBooks = Array.from(document.querySelectorAll('.book-card.selected'))
                               .map(card => card.dataset.title);
                               
    console.log("Selected books:", Array.from(document.querySelectorAll('.book-card.selected'))
                               .map(card => card.dataset.title));
    alert(`You have read ${selectedBooks.length} books:\n\n${selectedBooks.join('\n')}`);
}

function getSelectedBooks() {
    return Array.from(document.querySelectorAll('.book-card.selected'))
                .map(card => card.dataset.title);
}


export { chooseAge, submitQuiz, getSelectedBooks };
