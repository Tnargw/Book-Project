import { searchBook } from './search.js';
import { getRecommendations } from './recommend.js';
import { prioritizedGenres } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Book Recommender loaded');
  const input = document.getElementById('titleInput');
  const btn = document.getElementById('searchButton');
  const resultDiv = document.getElementById('results');

  btn.addEventListener('click', handleSearch);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSearch();
  });

  async function handleSearch() {
    const title = input.value.trim();
    resultDiv.innerHTML = '';
    if (!title) return alert('Please enter a book title.');

    const search = await searchBook(title);
    if (!search) {
      resultDiv.textContent = `No book found with title "${title}".`;
      return;
    }

    const { doc, workData, ageGroup } = search;

    resultDiv.innerHTML = `
      <h3>Original Book</h3>
      <p><strong>Title:</strong> ${workData.title || title}</p>
      <p><strong>Author:</strong> ${doc.author_name?.join(', ') || 'Unknown'}</p>
      <p><strong>Age Group:</strong> ${ageGroup || 'Not detected'}</p>
    `;

    const genre = (workData.subjects || [])
      .map(s => s.toLowerCase())
      .find(tag => prioritizedGenres.includes(tag)) || 'fantasy';

    const recommendations = await getRecommendations(
      genre,
      doc.author_name?.[0]?.toLowerCase() || '',
      ageGroup
    );

    const ul = document.createElement('ul');
    recommendations.forEach(rec => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${rec.thumbnail ? `<img src="${rec.thumbnail}" height="50">` : ''}
        <a href="${rec.link}" target="_blank">${rec.title}</a> – ${rec.authors}
        <details><summary>Show JSON</summary><pre>${JSON.stringify(rec.raw, null, 2)}</pre></details>
      `;
      ul.appendChild(li);
    });

    resultDiv.appendChild(document.createElement('hr'));
    resultDiv.appendChild(ul);
  }
});
