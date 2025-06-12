import { blockedSubjects, prioritizedGenres } from './config.js';
import { matchesAgeGroup } from './utils.js';

export async function getRecommendations(genre, originalAuthor, detectedAgeGroup) {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:"${encodeURIComponent(genre)}"&maxResults=20&langRestrict=en&printType=books`);
  const data = await res.json();
  const recResults = new Map();

  for (const item of data.items || []) {
    const info = item.volumeInfo;
    if (!info.title || (info.authors?.some(a => a.toLowerCase().includes(originalAuthor)))) continue;
    if (info.language && info.language !== 'en') continue;
    if (info.categories?.some(cat => cat.toLowerCase().includes('nonfiction'))) continue;
    if (detectedAgeGroup && !matchesAgeGroup(info, detectedAgeGroup)) continue;

    // Open Library cross-check
    let openLibJSON = null;
    try {
      const olSearchRes = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(info.title)}&author=${encodeURIComponent(info.authors?.[0] || '')}&limit=1`);
      const olData = await olSearchRes.json();
      const match = olData.docs?.[0];
      if (match?.key) {
        let workKey = match.key.startsWith('/works/') ? match.key : `/works/${match.key}`;
        const workRes = await fetch(`https://openlibrary.org${workKey}.json`);
        openLibJSON = await workRes.json();

        const lowerSubjects = (openLibJSON.subjects || []).map(s => s.toLowerCase());
        if (blockedSubjects.some(b => lowerSubjects.some(sub => sub.includes(b)))) continue;
      }
    } catch (e) {
      console.warn('Open Library fallback failed for', info.title);
    }

    const key = info.title.toLowerCase().replace(/[^\w\s]/gi, '');
    if (!recResults.has(key)) {
      recResults.set(key, {
        title: info.title,
        authors: info.authors?.join(', ') || 'Unknown',
        link: info.infoLink || '#',
        thumbnail: info.imageLinks?.thumbnail || '',
        raw: openLibJSON || item
      });
    }
  }


  Object.keys(localStorage).forEach(key => {
    console.log(`${key}: ${localStorage.getItem(key)}`);
});


  return Array.from(recResults.values());
}
