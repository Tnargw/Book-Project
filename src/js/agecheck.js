document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById('name');
  const birthdayInput = document.getElementById('birthday');
  const restrictions = document.getElementById('restrictions-section');
  const descriptionBox = document.getElementById("restriction-description");
  const continueBtn = document.getElementById('continue-btn');

  const descriptions = {
    "adult": "Adult content includes mature themes and complex storylines intended for ages 18 and up.",
    "young-adult": "Young Adult content features themes suitable for teens, ages 13-17, including coming-of-age stories.",
    "children": "Children's content is designed to be safe, fun, and age-appropriate for those under 13."
  };

  let userAge = null;

  function isValidDate(dateString) {
    // Matches YYYY-MM-DD format and ensures it's a real date
    const date = new Date(dateString);
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(dateString) &&
      !isNaN(date.getTime())
    );
  }

  function calculateAge(birthdayString) {
    const birthday = new Date(birthdayString);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return age;
  }

  function checkAgeAndToggle() {
    const nameValue = nameInput.value.trim();
    const birthdayValue = birthdayInput.value;

    if (!nameValue || !isValidDate(birthdayValue)) {
      restrictions.style.display = 'none';
      return false;
    }

    userAge = calculateAge(birthdayValue);

    if (userAge >= 13) {
      restrictions.style.display = 'block';
    } else {
      restrictions.style.display = 'none';
    }

    return true;
  }

  // Trigger check when full date is selected and focus leaves field
  birthdayInput.addEventListener("blur", checkAgeAndToggle);
  nameInput.addEventListener("blur", checkAgeAndToggle);

  // Update restriction description
  document.querySelectorAll('input[name="content"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      const selected = e.target.value;
      descriptionBox.textContent = descriptions[selected] || "";
    });
  });

  continueBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const birthday = birthdayInput.value;

    if (!name) {
      alert('Please enter your name.');
      return;
    }
    if (!isValidDate(birthday)) {
      alert('Please enter a valid birthday.');
      return;
    }

    userAge = calculateAge(birthday);
    localStorage.setItem('userAge', userAge);

    if (userAge >= 13) {
      const selected = document.querySelector('input[name="content"]:checked');
      if (!selected) {
        alert("Please select a content restriction before continuing.");
        return;
      }
      localStorage.setItem("contentRestriction", selected.value);
    } else {
      localStorage.removeItem("contentRestriction");
    }

    // Proceed to next page
    window.location.href = "Playground/recommendations/bookPicker.html";
  });
});

const birthdayInput = document.getElementById('birthday');



function updateBirthdayColor() {
  if (birthdayInput.value) {
    birthdayInput.classList.remove('empty');
  } else {
    birthdayInput.classList.add('empty');
  }
}

// Run on page load and whenever input changes
document.addEventListener('DOMContentLoaded', updateBirthdayColor);
birthdayInput.addEventListener('input', updateBirthdayColor);
