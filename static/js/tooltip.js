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
      let tooltipX, tooltipY;
      const $target = $(event.target);

      if ($target.is("img")) {
        // For images, position at top-right corner
        const $img = $target;
        const imgOffset = $img.offset();
        tooltipX = imgOffset.left + $img.outerWidth() - 30;
        tooltipY = imgOffset.top - tooltip.outerHeight() - 5;
      } else {
        // Default behavior for non-image elements
        tooltipX = event.pageX - 15;
        tooltipY = event.pageY - tooltip.outerHeight() - 30;

        // Check if the tooltip goes beyond the top of the screen
        if (tooltipY < $(window).scrollTop()) {
          tooltipY = event.pageY + 15;
        }

        // Check if the tooltip overflows the right or left edge of the window
        const windowWidth = $(window).width();
        const tooltipWidth = tooltip.outerWidth();
        const spaceLeft = windowWidth - tooltipX;
        const leftSpace = tooltipX;

        if (spaceLeft < tooltipWidth || leftSpace < tooltipWidth) {
          console.log("Adjusting tooltip width due to limited space");
          // Set width to 200px with !important to override CSS
          tooltip.attr(
            "style",
            "width: 180px !important; white-space: normal; height: auto; max-width: none;"
          );
          // Force reflow
          const reflow = tooltip[0].offsetHeight;
          // Recalculate tooltip height and adjust Y position accordingly
          tooltipY = event.pageY - tooltip.outerHeight() - 30;
          if (tooltipY < $(window).scrollTop()) {
            tooltipY = event.pageY + 15;
          }
          tooltipX = event.pageX - tooltip.outerWidth() - 15;
        }
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
    const targets = $this.find("input, select, #help-icon, .has-tip");

    targets.on("mouseenter", function (event) {
      const $target = $(event.target);
      const isHelpIcon =
        $target.is("#help-icon") || $target.closest("#help-icon").length > 0;

      // Show tooltip only if .has-tip contains an image
      if ($target.hasClass("has-tip") && $target.find("img").length > 0) {
        const img = $target.find("img").first();
        const fakeEvent = {
          target: img[0],
          pageX: img.offset().left + img.outerWidth(),
          pageY: img.offset().top,
        };
        showTooltip(fakeEvent, false);
      } else if ($target.is("img") || $target.hasClass("help")) {
        const fakeEvent = {
          target: event.target,
          pageX: $target.offset().left + $target.outerWidth(),
          pageY: $target.offset().top,
        };
        showTooltip(fakeEvent, false);
      } else if (!isHelpIcon) {
        showTooltip(event, true);
      }
    });

    targets.on("mouseleave", hideTooltip);
  });
});
