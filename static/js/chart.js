var i, j, yScale;

class PersonChart {
  constructor(data) {
    this.person_data = data;
    this.all_charts = ["creator", "recipient", "mentioned"];
    this.all_chart_titles = [
      "Letters written",
      "Letters received",
      "Letters mentioning",
    ];
    this.stacked = 1;
    this.split = 2;
    this.separate = 3;
    this.unknownYear = "9999";
    this.unknownYearText = "?";
    this.have = {
      creator: false,
      recipient: false,
      mentioned: false,
      unknown: false,
    };
    this.person_data_without_unknown = [];
    this.person_data_with_unknown = [];
    this.charts = [];
    this.chart_titles = [];
    this.show_unknown = true;
    this.bars_are = this.separate;
    this.svg_chart = null;
    this.axes = [];
    this.svg_height_base = 120;
    this.svg_chart_gap = 25;
    this.label_space_bottom = 20;
    this.label_space_top = 20;
    this.label_space_left = 35;
    this.label_space_right = 15;
    this.bars_are = this.separate;
    this.svg_width = 0;
    this.svg_height = 0;
    this.chart_width = 0;
    this.beginning = true;
    this.person_data_length = 0;
    this.svgChart;
    this.max_value;

    this.setupData();
    this.setupcharts();
  }

  setupData() {
    console.log("peron_dat", this.person_data, this.person_data.length);
    if (
      this.person_data[this.person_data.length - 1].year ===
      this.unknownYear * 1
    ) {
      this.have.unknown = true;
      this.person_data_with_unknown = person_data;
      this.person_data_without_unknown = person_data.slice(0, -1); // Shallow clone!
    } else {
      this.person_data_without_unknown = this.person_data_with_unknown =
        this.person_data;
    }
  }

  setupcharts() {
    // Check we have data for each graph
    for (i = 0; i < this.all_charts.length; i++) {
      let c = this.all_charts[i];
      for (j = 0; j < this.person_data_with_unknown.length; j++) {
        if (this.person_data_with_unknown[j][c] != 0) {
          this.have[c] = true;
          break;
        }
      }
    }

    // Specify the charts we have
    for (i = 0; i < this.all_charts.length; i++) {
      if (this.have[this.all_charts[i]]) {
        this.charts.push(this.all_charts[i]);
        this.chart_titles.push(this.all_chart_titles[i]);
      }
    }

    // Check we only have unknowns
    for (i = 0; i < this.person_data_without_unknown.length; i++) {
      for (j = 0; j < this.all_charts.length; j++) {
        if (this.person_data_with_unknown[i][this.all_charts[j]] != 0) {
          this.showUnknown = false;
          break;
        }
      }

      if (!this.showUnknown) {
        break;
      }
    }

    this.renderCharts();
  }

  renderCharts() {
    this.svg_width = d3.select("#chart").style("width").replace("px", "");

    this.svg_height =
      this.svg_height_base * this.charts.length +
      this.svg_chart_gap * (this.charts.length - 1);

    this.chart_width =
      this.svg_width - this.label_space_left - this.label_space_right;

    this.svgChart = d3
      .select("#chart")
      .append("svg")
      .attr("class", "chart single")
      .attr("width", this.svg_width)
      .attr("height", this.svg_height);

    if (this.showUnknown) {
      this.person_data = this.person_data_with_unknown;
    } else {
      this.person_data = this.person_data_without_unknown;
    }

    this.max_value = this.getMax(this.person_data, this.showUnknown);
    this.person_data_length = this.person_data.length;
    this.beginning = true;
    this.axes = [];

    const max_value = this.getMax(this.person_data, this.showUnknown);

    for (let i = 0; i < this.charts.length; i++) {
      const chart = this.charts[i];
      if (this.have[chart]) {
        const chart_height =
          this.svg_height_base - this.label_space_top - this.label_space_bottom;
        const chart_x = this.label_space_left;
        const chart_y =
          i * (this.svg_height_base + this.svg_chart_gap) +
          this.label_space_top;

        // Draw title
        this.svgChart
          .append("text")
          .classed("chart-title", true)
          .classed(chart, true)
          .attr("x", chart_x - 10)
          .attr("y", chart_y - 10)
          .text(this.chart_titles[i]);

        // Create Y scale (scoped per chart)
        yScale = d3.scale
          .linear()
          .domain([0, max_value])
          .rangeRound([chart_height, 0]);

        // Create X scale (scoped per chart)
        const xScaleDomain = this.getXScaleDomain(
          this.person_data,
          this.show_unknown
        );
        const xScale = d3.scale
          .ordinal()
          .domain(xScaleDomain)
          .rangeRoundBands([0, this.chart_width], 0.2);

        const y_ticks = this.getYAxisTickNumber(max_value, this.bars_are);

        const yTickMarks = yScale.ticks(y_ticks);

        this.svgChart
          .append("svg:g")
          .classed("guidelines", 1)
          .selectAll("line.guideline." + chart)
          .data(yTickMarks, function (d, j) {
            return d == 0 ? 0 : j + "-" + chart;
          })
          .enter()
          .append("line")
          .classed("guideline", 1)
          .classed(chart, 1)
          .attr("x1", chart_x)
          .attr("x2", chart_x + this.chart_width)
          .attr("y1", function (d) {
            return chart_y + yScale(d);
          })
          .attr("y2", function (d) {
            return chart_y + yScale(d);
          });

        // Draw Axes
        const xAxis = d3.svg
          .axis()
          .scale(xScale)
          .orient("bottom")
          .tickValues(this.getXAxisTicks(xScale.domain(), this.chart_width));

        const yAxis = d3.svg
          .axis()
          .scale(yScale)
          .orient("left")
          .tickFormat(d3.format("f"))
          .ticks(y_ticks)
          .tickSize(4, 2, 0);

        this.axes[chart] = { x: xAxis, y: yAxis };

        this.svgChart
          .append("g")
          .classed("xaxis", true)
          .classed("axis", true)
          .classed("label", true)
          .classed(chart, true)
          .attr("transform", `translate(${chart_x},${chart_y + chart_height})`)
          .call(xAxis);

        this.svgChart
          .append("g")
          .classed("yaxis", true)
          .classed("axis", true)
          .classed("label", true)
          .classed(chart, true)
          .attr("transform", `translate(${chart_x},${chart_y})`)
          .call(yAxis);

        // Render bars for this chart
        this.renderBars(chart, xScale, yScale, chart_x, chart_y, chart_height);
      }
    }
  }

  renderBars(chart, xScale, yScale, chart_x, chart_y, chart_height) {
    const bars = this.svgChart
      .selectAll(`rect.${chart}`)
      .data(this.person_data, (d) => `${d.year}-${chart}`);

    // Enter: Create new bars
    bars
      .enter()
      .append("rect")
      .classed("bar", true)
      .classed(chart, true)
      .attr("x", (d, i) => chart_x + xScale(i))
      .attr("y", chart_y + chart_height)
      .attr("width", xScale.rangeBand())
      .attr("height", 0);

    bars
      .transition()
      .duration(500)
      .attr("x", (d, i) => chart_x + xScale(i))
      .attr("y", (d) => chart_y + yScale(d[chart]))
      .attr("width", xScale.rangeBand())
      .attr("height", (d) => chart_height - yScale(d[chart]));

    // Exit: Remove bars that are no longer needed
    bars.exit().remove();
  }

  getMax(person_data, includeUnknown) {
    return d3.max(person_data, function (d) {
      if (!includeUnknown && d.year == this.unknownYear) {
        return 0;
      }

      if (this.bars_are == this.stacked) {
        return d.creator + d.recipient + d.mentioned;
      }

      return d3.max([d.creator, d.recipient, d.mentioned]);
    });
  }

  getXScaleDomain(person_data, showUnknown) {
    const xDomain = [];
    this.person_data_length = person_data.length;
    for (var j = 0; j < this.person_data_length; j++) {
      var year = this.person_data[j].year;

      if (showUnknown || year != this.unknownYear) {
        if (year == this.unknownYear) xDomain.push(this.unknownYearText);
        else xDomain.push(year);
      }
    }

    return xDomain;
  }

  getXAxisTicks(xScaleDomain, chart_width) {
    // Work out what years to display given space.
    let xAxisTicksDomain = xScaleDomain,
      xAxisTicks = [],
      widthBar = chart_width / xAxisTicksDomain.length,
      ticks_every = 10,
      val,
      j;

    if (widthBar > 40) {
      ticks_every = 1;
    } else if (widthBar > 20) {
      ticks_every = 3;
    } else if (widthBar > 10) {
      ticks_every = 5;
    }

    for (j = 0; j < xAxisTicksDomain.length; j++) {
      val = xAxisTicksDomain[j];
      if (j % ticks_every == 0 || val == this.unknownYearText) {
        xAxisTicks.push(val);
      }
    }

    return xAxisTicks;
  }

  getYAxisTickNumber(max_value, bars_are) {
    // Vertical lines
    let y_ticks = 3;
    if (max_value < y_ticks) {
      y_ticks = max_value;
    } else if (bars_are != this.separate && max_value >= y_ticks * 3) {
      y_ticks *= 3;
    }
    return y_ticks;
  }

  getYAxisSubTickNumber(yAxisTicks, bars_are) {
    if (bars_are != this.separate) {
      if (yAxisTicks && yAxisTicks.length >= 2) {
        var sep = yAxisTicks[1] - yAxisTicks[0] - 1;
        return d3.min([sep, 4]); // TODO, work out a good value;
      }
    }

    return 0;
  }

  getChart(number) {
    if (number < this.charts.length) {
      return this.charts[number];
    }
    return "";
  }

  updateCharts(duration, delay) {
    this.person_data = this.showUnknown
      ? this.person_data_with_unknown
      : this.person_data_without_unknown;

    this.person_data_length = this.person_data.length;

    this.max_value = this.getMax(this.person_data, this.showUnknown, chart);

    this.chart_height =
      this.svg_height_base - this.label_space_top - this.label_space_bottom;
    var chart_x = this.label_space_left;

    if (this.bars_are == this.stacked || this.bars_are == this.split) {
      this.chart_height =
        this.svg_height - this.label_space_top - this.label_space_bottom;
    }

    const yScale = d3.scale.linear();
    //
    // Update Y scale
    //
    //stretchLowerYScale = ( (max_value / 4) > 10 );
    //if( stretchLowerYScale )
    //	yScale.domain( [0,10,max_value] ).range( [chart_height,chart_height - chart_height/4,0] ); // enhance values between 1 and 10 so we can see them easier.
    //else
    yScale.domain([0, this.max_value]).range([this.chart_height, 0]);

    //
    // Update Xscale
    //
    const xScaleDomain = this.getXScaleDomain(
      this.person_data,
      this.showUnknown
    );
    const xScale = d3.scale
      .ordinal()
      .domain(xScaleDomain)
      .rangeRoundBands([0, this.chart_width], 0.2);
    xScale.domain(xScaleDomain);

    //
    // Axes
    //

    // Work out what years to display given space.
    var xAxisTicks = this.getXAxisTicks(xScale.domain(), this.chart_width);

    var y_ticks = this.getYAxisTickNumber(this.max_value, this.bars_are);

    // Update axes.
    for (j = 0; j < this.charts.length; j++) {
      var chart = this.charts[j],
        xAxis = this.axes[chart].x,
        yAxis = this.axes[chart].y;

      xAxis.scale(xScale).tickValues(xAxisTicks);

      yAxis.scale(yScale).ticks(y_ticks);

      yAxis.tickSubdivide(
        this.getYAxisSubTickNumber(yScale.ticks(y_ticks), this.bars_are)
      );

      this.svgChart
        .select(".xaxis." + chart)
        .transition()
        .duration(duration)
        .call(xAxis);

      this.svgChart
        .select(".yaxis." + chart)
        .transition()
        .duration(duration)
        .call(yAxis);
    }

    // Vertical lines
    var yTickMarks = yScale.ticks(y_ticks);
    //if( stretchLowerYScale ) {
    //	yTickMarks.push(10);
    //}
    let self = this;

    var guidelines = this.svgChart
      .select("g.guidelines")
      .selectAll("line.guideline." + this.getChart(0))
      .data(yTickMarks, function (d, i) {
        return d == 0 ? 0 : i + "-" + self.getChart(0);
      });

    guidelines
      .enter()
      .append("line")
      .classed("guideline", 1)
      .classed(this.getChart(0), 1)
      .attr("x1", chart_x)
      .attr("x2", chart_x + this.chart_width);
    //.attr("y1", chart_y)
    //.attr("y2", chart_y)

    guidelines.exit().remove();

    guidelines
      .transition()
      .duration(duration)
      .attr("y1", function (d) {
        return self.label_space_top + yScale(d);
      })
      .attr("y2", function (d) {
        return self.label_space_top + yScale(d);
      });

    if (this.bars_are == this.stacked || this.bars_are == this.split) {
      for (i = 0; i < this.charts.length - 1; i++) {
        // first ones
        this.fade(".xaxis." + this.charts[i], false, duration);
      }

      for (i = 1; i < this.charts.length; i++) {
        // last ones
        this.fade(".yaxis." + this.charts[i], false, duration);
        this.fade(".guideline." + this.charts[i], false, duration);
        this.fade(".chart-title." + this.charts[i], false, duration);
      }

      var title = this.chart_titles[0];
      if (this.charts.length == 3)
        title += ", " + this.chart_titles[1] + " and " + this.chart_titles[2];
      else if (this.charts.length == 2) title += " and " + this.chart_titles[1];

      this.svgChart.select(".chart-title." + this.getChart(0)).text(title);
    }

    if (this.bars_are == this.separate) {
      for (i = 0; i < this.charts.length - 1; i++) {
        this.fade(".xaxis." + this.charts[i], true, duration);
      }

      for (i = 1; i < this.charts.length; i++) {
        this.fade(".yaxis." + this.charts[i], true, duration);
        this.fade(".guideline." + this.charts[i], true, duration);
        this.fade(".chart-title." + this.charts[i], true, duration);
      }

      if (this.charts.length > 0) {
        this.svgChart
          .select(".chart-title." + this.getChart(0))
          .text(this.chart_titles[0]);
      }
    }

    for (i = 0; i < this.charts.length; i++) {
      var chart = this.charts[i];
      if (this.have[chart]) {
        var chart_y =
          i * (this.svg_height_base + this.svg_chart_gap) +
          this.label_space_top;

        if (this.bars_are == this.stacked || this.bars_are == this.split) {
          chart_y = this.label_space_top;
        }

        //
        // Bars
        //
        var bars = this.svgChart
          .selectAll("rect." + chart)
          .data(this.person_data, function (d) {
            return d.year + "-" + chart;
          });

        // Create any new bars
        bars
          .enter()
          .append("rect")
          .classed("bar", 1)
          .classed(chart, 1)
          .attr("x", chart_x + this.chart_width + 2) // hide off right
          .attr("y", chart_y + this.chart_height)
          .attr("width", xScale.rangeBand())
          .attr("height", 0)
          .classed("unknown", function (d) {
            return d.year == this.unknownYear;
          });

        // Remove unwanted bars
        bars
          .exit()
          .transition()
          .duration(duration)
          .attr("x", chart_x + this.chart_width + 2) // hide off right
          .remove();
        // let self = this;
        bars.append("title").text(function (d) {
          var year = d.year != this.unknownYear ? d.year : "Years unknown";
          return year + ": " + d[chart] + " " + self.chart_titles[i];
        });

        if (this.beginning) {
          // when first open we don't want things to move in from right.
          bars.attr("x", function (d, i) {
            return chart_x + xScale(i);
          });
        }

        // Update all bars
        bars
          .transition()
          .duration(duration)
          .delay(delay)
          .attr("x", function (d, i) {
            var offset = 0;
            if (self.bars_are == self.split) {
              if (chart == self.getChart(1))
                offset = xScale.rangeBand() / self.charts.length;
              else if (chart == self.getChart(2))
                offset = (xScale.rangeBand() * 2) / self.charts.length;
            }

            return chart_x + xScale(i) + offset;
          })
          .attr("y", function (d) {
            var value = d[chart];

            if (self.bars_are == self.stacked) {
              if (chart == self.getChart(0))
                for (j = 1; j < self.charts.length; j++)
                  value += d[self.charts[j]];
              else if (chart == self.getChart(1))
                for (j = 2; j < self.charts.length; j++)
                  value += d[self.charts[j]];
            }

            return chart_y + yScale(value);
          })
          .attr("width", function () {
            if (self.bars_are == self.split)
              return xScale.rangeBand() / self.charts.length;

            return xScale.rangeBand();
          })
          .attr("height", function (d) {
            return self.chart_height - yScale(d[chart]);
          });
      }
    }

    this.beginning = false;
  }

  fade(item, fade_in, duration) {
    if (fade_in) {
      this.svgChart
        .selectAll(item)
        .transition()
        .duration(duration / 2)
        .delay((3 * duration) / 2)
        .style("opacity", "1");
    } else {
      this.svgChart
        .selectAll(item)
        .transition()
        .duration((3 * duration) / 2)
        .style("opacity", "0");
    }
  }

  switchBars(bars_should_be) {
    this.bars_are = bars_should_be;
    this.highlight(["#bars_stacked", "#bars_split", "#bars_seperate"], false);
    this.highlight([`#bars_${bars_should_be}`], true);

    this.updateCharts(1000, 0);
  }

  highlight(selectors, highlight) {
    selectors.forEach((selector) => {
      d3.select(selector).classed("highlight", highlight);
    });
  }

  hide(selectors, hide) {
    selectors.forEach((selector) => {
      d3.select(selector).style("display", hide ? "none" : "inline-block");
    });
  }

  unknownShow(show) {
    if (show) {
      this.highlight(["#show_unknown"], true);
      d3.select("#show_unknown").text("Hide unknown");
      this.show_unknown = true;
    } else {
      this.highlight(["#show_unknown"], false);
      d3.select("#show_unknown").text("Show unknown");
      this.show_unknown = false;
    }

    this.updateCharts(1000, 0);
  }

  launchFullScreen() {
    var d3FullscreenButton = d3.select("#fullscreen"); // assuming modernizr

    if (d3FullscreenButton) {
      this.hide(["#fullscreen"], false);

      var fullscreen = false;

      var d3Chart = d3.select("#chart");
      if (fullscreen) {
        d3Chart.style("-ms-transform", "");
        d3Chart.style("-webkit-transform", "");
        d3Chart.style("transform", "");
        d3FullscreenButton.text("Fullscreen");
      } else {
        d3FullscreenButton.text("Close");

        var gapWidth = window.innerWidth * 0.02,
          gapHeight = window.innerHeight * 0.02,
          winWidth = window.innerWidth - gapWidth * 2,
          winHeight = window.innerHeight - gapHeight * 2,
          chartBox = d3Chart.node().getBoundingClientRect(),
          scaleWidth = winWidth / chartBox.width,
          scaleHeight = winHeight / chartBox.height,
          scale = 1;

        scale = scaleHeight;
        if (scale * chartBox.width > winWidth) {
          scale = scaleWidth;
        }

        var centredX = (window.innerWidth - chartBox.width) / 2,
          centredY = (window.innerHeight - chartBox.height) / 2;

        var transform = "";
        transform += "scale(" + scale + ")";
        transform +=
          " translate(" +
          (centredX - chartBox.left) / scale +
          "px," +
          (centredY - chartBox.top) / scale +
          "px)";
        // !! transform += " rotate(180deg)";

        d3Chart.style("-ms-transform", transform);
        d3Chart.style("-webkit-transform", transform);
        d3Chart.style("transform", transform);
      }

      fullscreen = !fullscreen;
      this.highlight(["#fullscreen"], fullscreen);
    }
  }
}

// Initialize the PersonChart
export default PersonChart;
