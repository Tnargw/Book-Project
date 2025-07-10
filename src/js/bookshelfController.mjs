const bookId = localStorage.getItem('currentBook');
const container = document.getElementById('bookDetails');

if (!bookId) {
  container.innerHTML = '<p>No book selected.</p>';
} else {
  fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
    .then(res => res.json())
    .then(data => {
      const info = data.volumeInfo;
      const title = info.title;
      const pageCount = info.pageCount || 0;
      const pagesReadKey = `pagesRead_${bookId}`;
      let pagesRead = parseInt(localStorage.getItem(pagesReadKey)) || 0;

      if (pagesRead > pageCount) pagesRead = pageCount;

      container.innerHTML = `
        ${info.imageLinks?.thumbnail ? `<img src="${info.imageLinks.thumbnail}" alt="Cover of ${title}">` : ''}
        <h2>${title}</h2>
        <p>Page Count: ${pageCount}</p>

        <div id="progressContainer">
          <p>Pages Read: <span id="pagesRead">${pagesRead}</span> / ${pageCount}</p>
          <div class="progress-bar">
            <div class="progress-bar-fill" id="progressFill"></div>
          </div>
        </div>

        <div id="pageInput">
          <input type="number" id="pagesToAdd" min="1" placeholder="Pages read">
          <button id="addPagesBtn">Add</button>
        </div>
      `;

      const fill = document.getElementById('progressFill');
      const pagesReadSpan = document.getElementById('pagesRead');
      const inputSection = document.getElementById('pageInput');

      function updateProgress() {
        const percent = pageCount > 0 ? (pagesRead / pageCount) * 100 : 0;
        fill.style.width = `${percent}%`;
        pagesReadSpan.textContent = pagesRead;
      }

      function updateReadingStats() {
        const finishedBooks = JSON.parse(localStorage.getItem('finishedBooks')) || [];
        const totalBooks = finishedBooks.length;
        const totalPages = finishedBooks.reduce((sum, book) => sum + book.pageCount, 0);

        const genreCounts = {};
        finishedBooks.forEach(book => {
          const genre = book.genre || 'Unknown';
          if (genreCounts[genre]) {
            genreCounts[genre]++;
          } else {
            genreCounts[genre] = 1;
          }
        });

        const genrePercentages = {};
        for (const [genre, count] of Object.entries(genreCounts)) {
          genrePercentages[genre] = (count / totalBooks) * 100;
        }

        const sidebar = document.getElementById('sidebarStats');
        sidebar.innerHTML = `
          <h3>My Reading Stats</h3>
          <p><strong>Total Books:</strong> ${totalBooks}</p>
          <p><strong>Total Pages:</strong> ${totalPages}</p>
          <h4>Genres:</h4>
          ${Object.entries(genrePercentages).map(([genre, pct]) => `
            <p>${genre}: ${pct.toFixed(1)}%</p>
            <div class="genre-bar" style="width:${pct}%;"></div>
          `).join('')}
        `;

        const statsDiv = document.getElementById('readingStats');
        statsDiv.innerHTML = `
          <h3>Reading Stats</h3>
          <p>Total Books Finished: <strong>${totalBooks}</strong></p>
          <p>Total Pages Read: <strong>${totalPages}</strong></p>
        `;
      }

      updateProgress();
      updateReadingStats();

      if (pagesRead === pageCount) {
        inputSection.innerHTML = `
          <a href="bookPicker.html">
            <button style="padding: 0.75rem 1.5rem; margin-top: 1rem;">Pick a New Book!</button>
          </a>
        `;
      } else {
        document.getElementById('addPagesBtn').addEventListener('click', () => {
          const input = document.getElementById('pagesToAdd');
          const addPages = parseInt(input.value);
          if (!isNaN(addPages) && addPages > 0) {
            pagesRead += addPages;
            if (pagesRead > pageCount) pagesRead = pageCount;

            localStorage.setItem(pagesReadKey, pagesRead);
            updateProgress();
            input.value = '';

            if (pagesRead === pageCount) {
              const finishedBooks = JSON.parse(localStorage.getItem('finishedBooks')) || [];
              const alreadyFinished = finishedBooks.some(book => book.id === bookId);
              if (!alreadyFinished) {
                const genre = localStorage.getItem('currentGenre');
                console.log(`Marking book as finished: ${title}, Genre: ${genre}`);
                finishedBooks.push({ id: bookId, title, pageCount, genre });
                localStorage.setItem('finishedBooks', JSON.stringify(finishedBooks));
                console.log(`Book "${title}" marked as finished.`);
              }

              updateReadingStats();

              inputSection.innerHTML = `
                <a href="bookPicker.html">
                  <button style="padding: 0.75rem 1.5rem; margin-top: 1rem;">Pick a New Book!</button>
                </a>
              `;
            }
          }
        });
      }
    })
    .catch(err => {
      console.error('Error fetching book details:', err);
      container.innerHTML = '<p>Failed to load book details. Try again later.</p>';
    });
}
