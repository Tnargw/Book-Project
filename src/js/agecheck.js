function checkAge() {
    const birthday = new Date(document.getElementById('birthday').value);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
  
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
  
    const restrictions = document.getElementById('restrictions-section');
  
    if (age >= 13) {
      restrictions.style.display = 'block';
    } else {
      restrictions.style.display = 'none';
      alert('Great! You’re ready to begin your journey!');
      // Optionally, proceed to next step here
    }
  }
  
  // toggle switch memory
    const form = document.getElementById("adventure-form");
  
    form.addEventListener("change", () => {
      const selected = document.querySelector('input[name="content"]:checked');
      if (selected) {
        console.log("Selected restriction:", selected.value);
        // You can store or act on the value here
      }
    });
  
  
    document.getElementById("restriction-continue").addEventListener("click", () => {
    const selected = document.querySelector('input[name="content"]:checked');
    if (selected) {
      localStorage.setItem("contentRestriction", selected.value);
      alert(`Content restriction set to: ${selected.value}`);
      // You could navigate to the next page or continue the flow here
    } else {
      alert("Please select a content restriction before continuing.");
    }
  });
  
  
  
  // ===Retrieve user restriction (beginning of): 
  // const userRestriction = localStorage.getItem("contentRestriction");
  // console.log("User's restriction is:", userRestriction);