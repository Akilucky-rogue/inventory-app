// 🌗 Theme toggle logic
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  body.setAttribute("data-theme", "dark");
  themeToggle.textContent = "☀️ Light Mode";
}

themeToggle.addEventListener("click", () => {
  const currentTheme = body.getAttribute("data-theme");
  if (currentTheme === "dark") {
    body.removeAttribute("data-theme");
    themeToggle.textContent = "🌙 Dark Mode";
    localStorage.setItem("theme", "light");
  } else {
    body.setAttribute("data-theme", "dark");
    themeToggle.textContent = "☀️ Light Mode";
    localStorage.setItem("theme", "dark");
  }
});
