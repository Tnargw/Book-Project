import { detectAgeGroup } from './utils.js';

export async function searchBook(title) {
  const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=10&fields=key,author_name,title`);
  const data = await res.json();
  const doc = data.docs.find(d => d.title.toLowerCase() === title.toLowerCase()) ||
              data.docs.find(d => d.title.toLowerCase().includes(title.toLowerCase()));

  if (!doc) return null;

  let workKey = doc.key.startsWith('/works/') ? doc.key : `/works/${doc.key}`;
  const workRes = await fetch(`https://openlibrary.org${workKey}.json`);
  const workData = await workRes.json();
  const ageGroup = detectAgeGroup(workData.subjects || []);

  return { doc, workData, ageGroup };
}
