import { searchBook } from './search.js';
import { prioritizedGenres } from './config.mjs';

// NEW: multi-book recommendation function
export async function handleBookSearch(titles, customRenderer = null) {
  const resultDiv = document.getElementById('results') || document.getElementById('recommendations');
  resultDiv.innerHTML = '';

  let allRecommendations = [];

  for (const title of titles) {
    const search = await searchBook(title);
    if (!search) {
      console.log(`No book found for: ${title}`);
      continue;
    }

    const { doc, workData } = search;

    const subjects = (workData.subjects || []).map(s => s.toLowerCase());
    const validSubjects = subjects.filter(s => prioritizedGenres.includes(s));

    for (const subject of validSubjects) {
      const recs = await getRecommendations(subject);
      allRecommendations = allRecommendations.concat(recs);
    }
  }

  // Deduplicate by book key (Open Library work key)
  const deduped = {};
  allRecommendations.forEach(rec => {
    deduped[rec.link] = rec;  // Use link as unique identifier
  });

  // Shuffle results to keep things fresh
  const finalRecs = shuffleArray(Object.values(deduped));

  if (customRenderer) {
    customRenderer(finalRecs);
    return;
  }

  // Default rendering
  const ul = document.createElement('ul');
  finalRecs.forEach(rec => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${rec.thumbnail ? `<img src="${rec.thumbnail}" height="50">` : ''}
      <a href="${rec.link}" target="_blank">${rec.title}</a> – ${rec.authors}
    `;
    ul.appendChild(li);
  });

  resultDiv.appendChild(ul);
}

// Keep your getRecommendations function simple again
export async function getRecommendations(genre) {
  const res = await fetch(`https://openlibrary.org/subjects/${encodeURIComponent(genre)}.json?limit=10`);
  const data = await res.json();

  return data.works.map(work => ({
    title: work.title,
    authors: (work.authors || []).map(a => a.name).join(', '),
    thumbnail: work.cover_id 
      ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg` 
      : null,
    link: `https://openlibrary.org${work.key}`,
    raw: work
  }));
}

// Shuffle helper
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}




