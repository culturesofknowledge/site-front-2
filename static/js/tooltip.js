$(document).ready(function () {
  $("[data-tip]").each(function () {
    const $this = $(this);
    const delay = parseFloat($this.data("delay")) || 0; // Default delay to 0 if missing
    const tooltipContent = $this.data("tip"); // Get tooltip content

    // Create tooltip element
    const tooltip = $('<div class="tooltip"></div>').html(tooltipContent);
    $("body").append(tooltip); // Append to body for absolute positioning

    let timeout;

    // Function to show tooltip
    const showTooltip = (event, applyDelay = true) => {
      tooltip.css({
        top: event.pageY + 15 + "px", // Position tooltip 15px below pointer
        left: event.pageX + "px", // Position tooltip near pointer
      });
      if (applyDelay) {
        timeout = setTimeout(() => {
          tooltip.addClass("show");
        }, delay * 1000); // Apply delay
      } else {
        tooltip.addClass("show"); // No delay
      }
    };

    // Function to hide tooltip
    const hideTooltip = () => {
      clearTimeout(timeout);
      tooltip.removeClass("show");
    };

    // Bind events to both input and help icon
    const targets = $this.find("input, #help-icon");

    targets.on("mouseenter", function (event) {
      const isHelpIcon = $(this).is("#help-icon");
      showTooltip(event, !isHelpIcon); // No delay for #help-icon
    });

    targets.on("mousemove", (event) => {
      tooltip.css({
        top: event.pageY + 15 + "px",
        left: event.pageX + "px",
      });
    });

    targets.on("mouseleave", hideTooltip);
  });
});
