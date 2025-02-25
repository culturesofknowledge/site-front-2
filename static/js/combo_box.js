const DEFAULT_SEARCH_FIELD_DISPLAY = 8;

document.addEventListener("DOMContentLoaded", function () {
  function enhanceSelect(select, threshold = 10) {
    if (select.options.length > threshold) {
      select.style.display = "none"; // Hide original select

      const wrapper = document.createElement("div");
      wrapper.classList.add("combo-box");

      // Create a fake select button
      const displayBox = document.createElement("div");
      displayBox.classList.add("combo-display");
      displayBox.textContent =
        select.options[select.selectedIndex]?.text || "Select an option";

      // Create dropdown container (hidden initially)
      const dropdown = document.createElement("div");
      dropdown.classList.add("combo-dropdown");
      dropdown.style.position = "absolute";
      dropdown.style.top = "100%";
      dropdown.style.width = "100%";
      dropdown.style.background = "#fff";
      dropdown.style.border = "1px solid #ccc";
      dropdown.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
      dropdown.style.display = "none";
      dropdown.style.zIndex = "1000";
      dropdown.style.maxHeight = "200px";
      dropdown.style.overflowY = "auto";

      // Search input inside the dropdown
      const searchBox = document.createElement("input");
      searchBox.type = "text";
      searchBox.classList.add("combo-search");
      searchBox.placeholder = "Search...";
      searchBox.style.width = "calc(100% - 10px)";
      searchBox.style.margin = "5px";
      searchBox.style.padding = "5px";
      searchBox.style.border = "1px solid #ccc";
      searchBox.style.boxSizing = "border-box";

      // Create the options list
      const optionsList = document.createElement("div");
      optionsList.classList.add("combo-options");

      // Populate options
      Array.from(select.options).forEach((option) => {
        const optionItem = document.createElement("div");
        optionItem.classList.add("combo-option");
        optionItem.textContent = option.text;
        optionItem.dataset.value = option.value;
        optionItem.style.padding = "8px";
        optionItem.style.cursor = "pointer";
        optionItem.style.borderBottom = "1px solid #eee";

        optionItem.addEventListener("click", () => {
          select.value = optionItem.dataset.value;
          select.dispatchEvent(new Event("change")); // Trigger change event
          displayBox.textContent = optionItem.textContent; // Update display
          dropdown.style.display = "none";
        });

        optionsList.appendChild(optionItem);
      });

      // Search filtering
      searchBox.addEventListener("input", () => {
        const searchTerm = searchBox.value.toLowerCase();
        Array.from(optionsList.children).forEach((option) => {
          option.style.display = option.textContent
            .toLowerCase()
            .includes(searchTerm)
            ? "block"
            : "none";
        });
      });

      // Open dropdown when clicking the display box
      displayBox.addEventListener("click", (event) => {
        event.stopPropagation();
        dropdown.style.display =
          dropdown.style.display === "block" ? "none" : "block";
        searchBox.focus();
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (event) => {
        if (!wrapper.contains(event.target)) {
          dropdown.style.display = "none";
        }
      });

      // Assemble dropdown
      dropdown.appendChild(searchBox);
      dropdown.appendChild(optionsList);
      wrapper.appendChild(displayBox);
      wrapper.appendChild(dropdown);
      select.parentNode.insertBefore(wrapper, select);
    }
  }

  // Apply to all select elements
  document
    .querySelectorAll("select")
    .forEach((select) => enhanceSelect(select, DEFAULT_SEARCH_FIELD_DISPLAY));
});
