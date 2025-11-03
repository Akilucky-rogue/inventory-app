const themeToggle = document.getElementById("themeToggle");
const body = document.body;

if (localStorage.getItem("theme") === "dark") {
  body.setAttribute("data-theme", "dark");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  const current = body.getAttribute("data-theme");
  if (current === "dark") {
    body.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "🌙";
  } else {
    body.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "☀️";
  }
});
