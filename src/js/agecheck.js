// ================================
// DOM Ready
// ================================
document.addEventListener("DOMContentLoaded", () => {

  // ================================
  // Element References
  // ================================
  const nameInput = document.getElementById('name');
  const birthdayInput = document.getElementById('birthday');
  const restrictions = document.getElementById('restrictions-section');
  const descriptionBox = document.getElementById("restriction-description");
  const continueBtn = document.getElementById('continue-btn');

  // ================================
  // Descriptions for Content Options
  // ================================
  const descriptions = {
    "adult": "Adult content includes mature themes and complex storylines intended for ages 18 and up.",
    "young-adult": "Young Adult content features themes suitable for teens, ages 13-17, including coming-of-age stories.",
    "children": "Children's content is designed to be safe, fun, and age-appropriate for those under 13."
  };

  let userAge = null;

  // ================================
  // Helper Functions
  // ================================
  function isValidDate(dateString) {
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

  // ================================
  // Name Auto-Capitalization
  // ================================
  nameInput.addEventListener('input', () => {
    const formatted = nameInput.value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    nameInput.value = formatted;
  });

  // ================================
  // Age Check Events
  // ================================
  birthdayInput.addEventListener("blur", checkAgeAndToggle);
  nameInput.addEventListener("blur", checkAgeAndToggle);

  // ================================
  // Content Radio Buttons - Description Updater
  // ================================
  document.querySelectorAll('input[name="content"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      const selected = e.target.value;
      descriptionBox.textContent = descriptions[selected] || "";
    });
  });

  // ================================
  // Continue Button Logic
  // ================================
  continueBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const birthday = birthdayInput.value;
    let hasError = false;

   // Clear name error on input if fixed
  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim()) {
      nameInput.classList.remove('input-error');
      document.getElementById('name-error').style.display = 'none';
    }
  });

  // Clear birthday error on input if fixed
  birthdayInput.addEventListener('input', () => {
    if (birthdayInput.value) {
      birthdayInput.classList.remove('input-error');
      document.getElementById('birthday-error').style.display = 'none';
    }
  });

    // Validate name
    if (!name) {
      nameInput.classList.add('input-error');
      const nameError = document.getElementById('name-error');
      nameError.textContent = 'Please enter your name.';
      nameError.style.display = 'block';
      hasError = true;
    }

    // Validate birthday
    if (!isValidDate(birthday)) {
      birthdayInput.classList.add('input-error');
      const birthdayError = document.getElementById('birthday-error');
      birthdayError.textContent = 'Please enter a valid birthday.';
      birthdayError.style.display = 'block';
      hasError = true;
    }

    if (hasError) return;

    // Store Age
    userAge = calculateAge(birthday);
    localStorage.setItem('userAge', userAge);

    // Store Content Restriction
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

// ================================
// Birthday Field Color Styling
// ================================
const birthdayInput = document.getElementById('birthday');

function updateBirthdayColor() {
  if (birthdayInput.value) {
    birthdayInput.classList.remove('empty');
  } else {
    birthdayInput.classList.add('empty');
  }
}

// Run on page load and when input changes
document.addEventListener('DOMContentLoaded', updateBirthdayColor);
birthdayInput.addEventListener('input', updateBirthdayColor);
