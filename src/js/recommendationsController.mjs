(async function () {
  const stored = localStorage.getItem('selectedBooks');
  if (!stored) {
    document.getElementById('recommendations').innerText = 'No books selected.';
    return;
  }

  const titles = JSON.parse(stored);
  console.log("Seed books:", titles);
  const cleanedTags = new Set();
  const originalAuthors = new Set();

  for (const title of titles) {
    await processBook(title);
  }

  await getRecommendations([...cleanedTags]);

  // ---------- Internal helper functions ------------

  async function processBook(title) {
    try {
      const searchRes = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=10&fields=key,author_name,title`);
      const searchData = await searchRes.json();

      const doc = searchData.docs.find(d => d.title.toLowerCase() === title.toLowerCase()) ||
        searchData.docs.find(d => d.title.toLowerCase().includes(title.toLowerCase()));

      if (!doc) return;

      let workKey = doc.key.startsWith('/works/') ? doc.key : `/works/${doc.key}`;
      const workRes = await fetch(`https://openlibrary.org${workKey}.json`);
      const workData = await workRes.json();

      if (doc.author_name?.length) {
        doc.author_name.forEach(a => originalAuthors.add(a.toLowerCase()));
      }

      const subjects = workData.subjects || [];
      const filtered = cleanSubjects(subjects, title);
      filtered.forEach(tag => cleanedTags.add(tag));

    } catch (err) {
      console.error("Error processing book:", err);
    }
  }

  function cleanSubjects(subjects, originalTitle) {
    const noisyTags = [
      'fiction', 'literature', 'english literature', 'fiction in english',
      'open library', 'staff picks', 'fictitious character', 'imaginary place',
      'untranslated', 'specimens', 'pictorial works', 'media tie-in',
      'toy and movable books', 'schultheater'
    ];

    const normalizeTag = t => t.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    const normSet = new Set();
    const results = [];

    for (const tag of subjects) {
      if (typeof tag !== 'string') continue;
      const lower = tag.toLowerCase();
      const norm = normalizeTag(lower);

      const isNoisy = noisyTags.some(noise =>
        noise !== 'fiction'
          ? lower.includes(noise)
          : (lower === 'fiction' || lower === 'general fiction' || lower === 'fiction in english')
      );

      if (
        lower.length < 2 ||
        !/^[\x00-\x7F]+$/.test(lower) ||
        isNoisy ||
        norm.includes(originalTitle.toLowerCase()) ||
        norm.includes("motion picture") ||
        norm.includes("media tiein") ||
        normSet.has(norm)
      ) {
        continue;
      }

      normSet.add(norm);
      results.push(tag);
    }

    return results;
  }

  async function getRecommendations(tags) {
    const container = document.getElementById('recommendations');
    container.innerHTML = '<h3>Fetching recommendations...</h3>';

        document.getElementById('backBtn').addEventListener('click', () => {
      window.location.href = '/Playground/recommendations/bookPicker.html';
    });


    const recResults = new Map();
    const queries = tags.slice(0, 8);

    for (const tag of queries) {
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:"${encodeURIComponent(tag)}"&maxResults=8&langRestrict=en&printType=books`);
        const data = await res.json();

        if (data.items) {
          for (const item of data.items) {
            const info = item.volumeInfo;
            if (!info.title) continue;

            if (info.authors?.some(a => originalAuthors.has(a.toLowerCase()))) continue;
            if (info.language && info.language !== 'en') continue;

            const titleKey = info.title.toLowerCase().replace(/[^\w\s]/gi, '');
            if (!recResults.has(titleKey)) {
              recResults.set(titleKey, {
                title: info.title,
                authors: info.authors?.join(', ') || 'Unknown',
                link: info.infoLink || '#',
                thumbnail: info.imageLinks?.thumbnail || '',
                sourceTag: tag,
                id: item.id
              });
            }
          }
        }
      } catch (err) {
        console.error("Error fetching Google Books:", err);
      }
    }

    if (!recResults.size) {
      container.innerHTML = '<p>No recommendations found.</p>';
      return;
    }

    container.innerHTML = '';
    const booksDiv = document.createElement('div');
    booksDiv.id = 'books';

    // Reference the button
    const continueBtn = document.getElementById('continueBtn');

    for (const rec of recResults.values()) {
      const card = document.createElement('div');
      card.className = 'book-card';
      card.innerHTML = `
        ${rec.thumbnail ? `<img src="${rec.thumbnail}" alt="${rec.title}">` : ''}
        <div class="book-title">${rec.title}</div>
        <div>${rec.authors}</div>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.book-card.selected').forEach(el => {
          el.classList.remove('selected');
        });
        card.classList.add('selected');

        localStorage.setItem('currentBook', rec.id);
        console.log(`Saved currentBook: ${rec.id}`);

        const currentGenre = localStorage.getItem('currentGenre') || 'Unknown';
        localStorage.setItem(`genre_${rec.id}`, currentGenre);
        console.log(`Saved genre_${rec.id}: ${currentGenre}`);

        continueBtn.style.display = 'block';
      });

      booksDiv.appendChild(card);
    }


    continueBtn.addEventListener('click', () => {
      window.location.href = '../recommendations/bookshelf.html';
    });

    console.log("Final recommendations:", Array.from(recResults.values()));
    container.appendChild(booksDiv);
  }

})();

