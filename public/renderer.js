document.addEventListener("DOMContentLoaded", () => {
  const inputSearch = document.getElementById("input-search");
  inputSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      window.mainAPI.searchTerm(e.target.value);
      e.preventDefault();
    }
  });
});
