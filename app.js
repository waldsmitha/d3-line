async function draw() {
  // Data
  const dataset = await d3.csv("data.csv");

  const parseDate = d3.timeParse("%Y-%m-%d");
  const xAccessor = (d) => parseDate(d.date);
  const yAccessor = (d) => parseInt(d.close);

  // Dimensions
  let dimensions = {
    width: 1000,
    height: 500,
    margins: 50,
  };

  dimensions.ctrWidth = dimensions.width - dimensions.margins * 2;
  dimensions.ctrHeight = dimensions.height - dimensions.margins * 2;

  // Draw Image
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const ctr = svg
    .append("g") // <g>
    .attr(
      "transform",
      `translate(${dimensions.margins}, ${dimensions.margins})`
    );

  const toolTip = d3.select("#tooltip");
  const toolTipDot = ctr
    .append("circle")
    .attr("r", 5)
    .attr("fill", "#fc8781")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .style("opacity", 0)
    .style("pointer-events", "none");

  // Scales
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.ctrHeight, 0])
    .nice();

  const xScale = d3
    // .scaleTime()
    .scaleUtc()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.ctrWidth]);

  // console.log(xScale(xAccessor(dataset[0])), dataset[0]);

  const lineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)));

  // console.log(lineGenerator(dataset));

  ctr
    .append("path")
    // Append all data with one element
    .datum(dataset)
    .attr("d", lineGenerator)
    .attr("fill", "none")
    .attr("stroke", "#30475e")
    .attr("stroke-width", 2);

  //Axes
  const xAxis = d3.axisBottom(xScale);

  const xAxisGroup = ctr
    .append("g")
    .call(xAxis)
    .style("transform", `translateY(${dimensions.ctrHeight}px)`);

  xAxisGroup
    .append("text")
    .attr("x", dimensions.ctrWidth / 2)
    .attr("y", dimensions.margins / 2 + 10)
    .attr("fill", "black")
    .classed("labels", true)
    .text("Date");

  const yAxis = d3.axisLeft(yScale).tickFormat((d) => `$${d}`);

  const yAxisGroup = ctr.append("g").call(yAxis);

  yAxisGroup
    .append("text")
    .attr("transform", "rotate(270)")
    .attr("y", -dimensions.margins / 2 - 10)
    .attr("x", -dimensions.ctrHeight / 2)
    .attr("fill", "black")
    .classed("labels", true)
    .text("Price");

  // Tool Tip
  ctr
    .append("rect")
    .attr("width", dimensions.ctrWidth)
    .attr("height", dimensions.ctrHeight)
    .style("opacity", 0)
    .on("touchmouse mousemove", function (event) {
      const mousePos = d3.pointer(event, this);
      const date = xScale.invert(mousePos[0]);

      // Custom Bisector - left (lowest possible index, etc.), center, right properties
      const bisector = d3.bisector(xAccessor).left;
      const index = bisector(dataset, date);
      const stock = dataset[index - 1];

      // console.log(mousePos);
      // console.log(date);
      // console.log(stock);

      // Update Image
      toolTipDot
        .style("opacity", 1)
        .attr("cx", xScale(xAccessor(stock)))
        .attr("cy", yScale(yAccessor(stock)))
        .raise();

      toolTip
        .style("display", "block")
        .style("top", yScale(yAccessor(stock)) - 20 + "px")
        .style("left", xScale(xAccessor(stock)) + "px");

      toolTip.select(".price").text(`$${yAccessor(stock)}`);

      const dateFormatter = d3.timeFormat("%B %-d, %Y");

      toolTip.select(".date").text(`${dateFormatter(xAccessor(stock))}`);
    })
    .on("mouseleave", function (event) {
      toolTipDot.style("opacity", 0);

      toolTip.style("display", "none");
    });
}

draw();
