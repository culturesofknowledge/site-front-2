function clearFields(container) {
  if (!container) return;

  // Reset all input fields with data-default attribute
  container.querySelectorAll('input[type="text"]').forEach(input => {
    if (input.hasAttribute('data-default')) {
      input.value = input.getAttribute('data-default');
    } else {
      input.value = '';
    }
  });

  // Reset all select fields to first option and trigger onchange if present
  container.querySelectorAll('select').forEach(select => {
    select.selectedIndex = 0;
    if (typeof select.onchange === 'function') {
      select.onchange();
    }

    // Reset combo box display if enhanced
    const comboBoxWrapper = select.parentElement.querySelector('.combo-box');
    if (comboBoxWrapper) {
      const displayBox = comboBoxWrapper.querySelector('.combo-display');
      if (displayBox) {
        displayBox.textContent = select.options[0]?.text || '';
      }
      const dropdown = comboBoxWrapper.querySelector('.combo-dropdown');
      if (dropdown) {
        dropdown.style.display = 'none';
      }
    }
  });

  // Reset checkboxes to unchecked
  container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
    if (typeof checkbox.onchange === 'function') {
      checkbox.onchange();
    }
  });
}
