document.addEventListener("DOMContentLoaded", function () {
  // Select the #back-top element and hide it initially
  var backTop = document.getElementById("back-top");

  if (backTop) {
    backTop.style.display = "none";

    // Show or hide the button based on scroll position
    window.addEventListener("scroll", function () {
      if (window.scrollY > 100) {
        backTop.style.display = "block";
      } else {
        backTop.style.display = "none";
      }
    });

    // Scroll smoothly to the top when the button is clicked
    backTop.addEventListener("click", function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
