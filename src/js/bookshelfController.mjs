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
  <div class="book-info-wrapper">
    ${info.imageLinks?.thumbnail ? `<img class="book-image" src="${info.imageLinks.thumbnail}" alt="Cover of ${title}">` : ''}
    
    <div class="book-details">
      <h2>${title}</h2>
      <p>Page Count: ${pageCount}</p>
      <div id="progressContainer" class="progress-container">
        <p>Pages Read: <span id="pagesRead">${pagesRead}</span> / ${pageCount}</p>
        <div class="progress-bar">
          <div class="progress-bar-fill" id="progressFill"></div>
          <img id="progressCharacter" src="" alt="Character" />
        </div>
      </div>
      <div id="pageInput">
        <input type="number" id="pagesToAdd" min="1" placeholder="Pages read">
        <button id="addPagesBtn">Add</button>
      </div>
    </div>
  </div>
`;


      // Load character from localStorage into progress bar and sidebar
      const charData = JSON.parse(localStorage.getItem("customCharacter"));
      const progressCharacter = document.getElementById("progressCharacter");
      if (charData && charData.image) {
        progressCharacter.src = charData.image;
        progressCharacter.alt = charData.name || "Character";

        // ALSO update the sidebar character display
        const sidebarCharacter = document.getElementById("characterImage");
        const characterName = document.getElementById("characterName");

        if (sidebarCharacter) {
          sidebarCharacter.src = charData.image;
          sidebarCharacter.alt = charData.name || "Character";
        }
        if (characterName) {
          characterName.textContent = charData.name || "";
        }
      }

      const pagesReadSpan = document.getElementById('pagesRead');
      const progressBarContainer = document.querySelector('.progress-bar');
      const fill = document.getElementById('progressFill');

      function animateProgressBarFill(targetPercent, duration = 3000) {
        const startWidth = parseFloat(fill.style.width) || 0;
        const startTime = performance.now();

        function animate(time) {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          const currentWidth = startWidth + (targetPercent * 100 - startWidth) * easedProgress;
          fill.style.width = `${currentWidth}%`;

          const containerWidth = progressBarContainer.offsetWidth;
          const characterWidth = progressCharacter.offsetWidth || 40;
          let leftPos = (currentWidth / 100) * containerWidth - characterWidth / 2;
          leftPos = Math.min(Math.max(leftPos, 0), containerWidth - characterWidth);
          progressCharacter.style.left = `${leftPos}px`;

          if (progress < 1) {
            progressCharacter.style.animation = 'wobbleWalk 0.4s infinite';
            requestAnimationFrame(animate);
          } else {
            progressCharacter.style.animation = 'bounceIdle 1.5s infinite ease-in-out';
          }
        }
        requestAnimationFrame(animate);
      }

      function updateProgress() {
        let pagesRead = parseInt(localStorage.getItem(pagesReadKey)) || 0;
        if (pagesRead > pageCount) pagesRead = pageCount;

        pagesReadSpan.textContent = pagesRead;

        const targetPercent = pageCount > 0 ? Math.pow(pagesRead / pageCount, 0.7) : 0;
        animateProgressBarFill(targetPercent);

        if (pagesRead === 0) {
          fill.style.width = '0%';
          progressCharacter.style.left = '0px';
          progressCharacter.style.animation = 'bounceIdle 1.5s infinite ease-in-out';
        }
      }

      function updateReadingStats() {
        const finishedBooks = JSON.parse(localStorage.getItem('finishedBooks')) || [];
        const totalBooks = finishedBooks.length;
        const totalPages = finishedBooks.reduce((sum, book) => sum + book.pageCount, 0);

        const genreCounts = {};
        finishedBooks.forEach(book => {
          const genre = book.genre || 'Unknown';
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });

        const genrePercentages = {};
        for (const [genre, count] of Object.entries(genreCounts)) {
          genrePercentages[genre] = (count / totalBooks) * 100;
        }

        const statsInfo = document.getElementById('statsInfo');
        if (statsInfo) {
          statsInfo.innerHTML = `
            <h3>My Reading Stats</h3>
            <p><strong>Total Books:</strong> ${totalBooks}</p>
            <p><strong>Total Pages:</strong> ${totalPages}</p>
            <h4>Genres:</h4>
            ${Object.entries(genrePercentages).map(([genre, pct]) => `
              <p>${genre}: ${pct.toFixed(1)}%</p>
              <div class="genre-bar" style="width:${pct}%; "></div>
            `).join('')}
          `;
        }

        const summaryStats = document.getElementById('summaryStats');
        if (summaryStats) {
          summaryStats.innerHTML = `
            <p><strong>Total Books Finished:</strong> ${totalBooks}</p>
            <p><strong>Total Pages Read:</strong> ${totalPages}</p>
          `;
        }
      }

      updateProgress();
      updateReadingStats();

      const inputSection = document.getElementById('pageInput');
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
                finishedBooks.push({ id: bookId, title, pageCount, genre });
                localStorage.setItem('finishedBooks', JSON.stringify(finishedBooks));
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

// CSS Animations
const styleEl = document.createElement('style');
styleEl.textContent = `
@keyframes wobbleWalk {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-5deg); }
}

@keyframes bounceIdle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
`;
document.head.appendChild(styleEl);
