document.addEventListener('DOMContentLoaded', function() {
  // Get the menu toggle button
  const menuToggle = document.querySelector('.toggle-topbar.menu-icon a');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Toggle the expanded class on the top-bar
      const topBar = document.querySelector('.top-bar');
      if (topBar) {
        topBar.classList.toggle('expanded');
      }
      
      // Toggle the menu section visibility
      const topBarSection = document.querySelector('.top-bar-section');
      if (topBarSection) {
        if (topBarSection.style.display === 'block') {
          topBarSection.style.display = 'none';
        } else {
          topBarSection.style.display = 'block';
        }
      }
    });
  }
  
  // Close menu when clicking on a link (for mobile)
  const navLinks = document.querySelectorAll('.top-bar-section ul li a');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth < 641) { // Mobile breakpoint
        const topBar = document.querySelector('.top-bar');
        const topBarSection = document.querySelector('.top-bar-section');
        
        if (topBar && topBarSection) {
          topBar.classList.remove('expanded');
          topBarSection.style.display = 'none';
        }
      }
    });
  });
});
