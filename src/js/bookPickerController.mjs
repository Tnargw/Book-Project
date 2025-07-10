import { chooseAge, submitBooks, getSelectedBooks } from './bookPicker.js';

window.addEventListener("DOMContentLoaded", () => {
  const age = localStorage.getItem('userAge');
  const restriction = localStorage.getItem('contentRestriction');

  if (!age || !restriction) {
    alert("Missing age or content restriction. Please go back and select those first.");
    window.location.href = "index.html";
    return;
  }

  chooseAge();

  document.getElementById("searchButton").addEventListener("click", () => {
    const titles = getSelectedBooks();
    if (titles.length === 0) {
      alert('Please select at least one book.');
      return;
    }
    localStorage.setItem('selectedBooks', JSON.stringify(titles));
    window.location.href = 'recommendations.html';
  });

  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('button.clicked').forEach(btn => btn.classList.remove('clicked'));
      button.classList.add('clicked');
    });
  });
});
