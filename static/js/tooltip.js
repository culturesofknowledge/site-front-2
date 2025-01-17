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
      let tooltipX = event.pageX;
      let tooltipY = event.pageY + 15; // Position tooltip 15px below pointer

      // Check if the tooltip overflows the right edge of the window
      const windowWidth = $(window).width();
      const tooltipWidth = tooltip.outerWidth();
      const spaceLeft = windowWidth - tooltipX;

      if (spaceLeft < tooltipWidth) {
        // If there's not enough space on the right, position on the left
        tooltipX = event.pageX - tooltipWidth - 15; // 15px from the pointer
      }

      tooltip.css({
        top: tooltipY + "px", // Position tooltip
        left: tooltipX + "px", // Position tooltip
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
    const targets = $this.find("input, select, #help-icon");

    targets.on("mouseenter", function (event) {
      const isHelpIcon = $(this).is("#help-icon");
      showTooltip(event, !isHelpIcon); // No delay for #help-icon
    });

    targets.on("mouseleave", hideTooltip);
  });
});
