const scroller = scrollama();

// initialize map and its measurements
const svg = d3.select("#map");
const width = +svg.attr("width");
const height = +svg.attr("height");

const projection = d3
  .geoMercator()
  .scale(250)
  .translate([width / 2, height / 1.6]);
const path = d3.geoPath().projection(projection);

let geoData, emissionsData;

// texts for each step in the story
const stepTexts = [
  "Carbon dioxide (CO2) emissions are a critical driver of climate change, playing a central role in intensifying global warming and its cascading effects. Rising CO2 levels are directly linked to observable phenomena such as increasing global temperatures, more frequent and severe extreme weather events, and accelerating sea level rise, all of which pose existential challenges to ecosystems and human societies alike.",

  "The year 2019 holds particular significance in this narrative. It serves not only as a pre-pandemic baseline for global emissions but also as a pivotal moment in climate advocacy and policy. The world witnessed a surge in climate activism, symbolized by Greta Thunberg’s global movement, and critical updates to national commitments under the Paris Agreement. Against this backdrop, this analysis goes beyond a descriptive recount of emissions data to examine the broader patterns of inequality, responsibility, and opportunity embedded in the 2019 emissions landscape, offering insights into the collective path forward in addressing the climate crisis.",

  "When discussing key contributors, the United States is typically one of the first countries brought up. Its heavy reliance on fossil fuels for electricity and several forms of transportation, alongside its sprawling infrastructure, leads to no surprise that it is one of the largest emitters in the world.",

  "Although it is often considered alongside the United States as part of the developed world, the European Union (and many other parts of Europe) has taken a much different approach to emissions and the resulting climate crisis. We have seen declines in emissions among EU countries, driven by ambitious policies regarding carbon pricing, renewable energy, and efficiency standards. Thus, we can see that, given appropriate attention and response, developed countries have at least some control over their environmental impact.",

  "As of 2019, China was the largest emitter of carbon dioxide in the world. With heavy reliance on coal as an energy source and having experienced rapid industrialization, it is no surprise that the level of emissions in China is so high. Similarly, India has been undergoing rapid economic growth, which has led to a surge in emissions. Despite this, its per capita emissions remain relatively low among high emitters, highlighting the vast inequalities in global carbon footprints.",

  "Regional disparities in CO2 emissions are closely tied to levels of economic development and industrialization. Wealthier nations, which underwent industrialization earlier, are responsible for the majority of historical emissions and have largely stabilized their output due to shifts toward service economies and renewable energy. In contrast, many developing nations, particularly in Africa, are in earlier stages of industrial growth. While their emissions remain low in absolute and per capita terms, they are beginning to rise as these countries expand economically.",

  "Despite their negligible emissions, small island nations in Oceania and beyond face disproportionate climate risks, such as rising sea levels and intensified storms. Similarly, landlocked countries often struggle with renewable energy adoption due to limited geographic resources, compounding the challenges of sustainable development. By observing historical trends, these regional disparities can be contextualized to show how economic inequality continues to shape both contributions to and vulnerabilities from climate change.",

  "The challenge of addressing carbon emissions and the climate crisis as a whole is not only a technical issue but also a moral one, prompting us to question the distribution of responsibility. Is it fair to hold low-emitting countries, whose contributions to the crisis are marginal in comparison, to the same standards as countries like the U.S., with energy-intensive lifestyles? Regardless of the answer, the longstanding battle with climate change requires global cooperation at a level we have never seen before. From observing EU countries, it is clear that there are steps nations can take to curb their harmful effects, but we must hold everyone, especially large emitters, accountable for their part in this fight.",
];

// coordinates for the map zoom for each step
const zoomCoordinates = [
  { scale: 250, translate: [width / 2, height / 1.6] }, // global
  { scale: 250, translate: [width / 2, height / 1.6] }, // global trends
  { scale: 1000, translate: [2500, 1250] }, // US
  { scale: 1200, translate: [500, 1650] }, // EU
  { scale: 800, translate: [-500, 900] }, // China/India
  { scale: 600, translate: [500, 500] }, // Africa
  { scale: 700, translate: [-900, 200] }, // Oceania
  { scale: 250, translate: [width / 2, height / 1.6] }, // narrative placeholder
];

// text box for transitions
const textBox = d3.select("#text-box");
const tooltip = d3.select("#tooltip");
const dropdownContainer = d3.select("#dropdown-container");
const metricSelect = d3.select("#metric-select");
const progressBar = d3.select("#progress-bar");

// AI: information under multiple_load in citations
// promise all because multiple things to load
Promise.all([
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"),
  d3.csv("/Data/CO2_emissions_all.csv"),
]).then(([data, emissions]) => {
  geoData = topojson.feature(data, data.objects.countries);

  emissionsData = emissions.filter((d) => d.Year === "2019");
  console.log(emissionsData);
  emissionsDataAll = emissions;
  console.log(emissionsDataAll);

  // creating two datasets as key-value pairs
  // AI ChatGPT: details in citations under splitting_data
  const emissionsByCountry = {};
  emissionsData.forEach((d) => {
    emissionsByCountry[d.Country] = {
      total: +d["Kilotons of Co2"],
      perCapita: +d["Metric Tons Per Capita"],
    };
  });

  // two color scales for each dataset
  const colorScales = {
    total: d3
      .scaleLog()
      .base(Math.E)
      .domain([
        d3.min(Object.values(emissionsByCountry).map((d) => d.total)),
        d3.max(Object.values(emissionsByCountry).map((d) => d.total)),
      ])
      .range(["#f0fcfc", "#004d40"]),
    perCapita: d3
      .scaleLinear()
      .domain([
        d3.min(Object.values(emissionsByCountry).map((d) => d.perCapita)),
        d3.max(Object.values(emissionsByCountry).map((d) => d.perCapita)),
      ])
      .range(["#f3f0ff", "#5e35b1"]),
  };

  function createLineChart(country) {
    const chartWidth = 150;
    const chartHeight = 50;
    const margin = { top: 5, right: 5, bottom: 20, left: 35 };

    // filter the specific country, sorted bc that matters apparantly
    // AI: details in citations under weird_line_charts
    const countryData = emissionsDataAll
      .filter((d) => d.Country === country)
      .sort((a, b) => +a.Year - +b.Year);

    if (countryData.length === 0) {
      return;
    }

    // ensure the line-chart container exists
    const chartContainer = d3.select("#tooltip").select(".line-chart");
    if (chartContainer.empty()) {
      d3.select("#tooltip").append("div").attr("class", "line-chart");
    }

    // select and clear an existing chart
    const svgContainer = d3.select("#tooltip").select(".line-chart");
    svgContainer.selectAll("*").remove();

    const svg = svgContainer
      .append("svg")
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", chartHeight + margin.top + margin.bottom);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain([
        d3.min(countryData, (d) => +d.Year),
        d3.max(countryData, (d) => +d.Year),
      ])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(countryData, (d) => +d["Kilotons of Co2"])])
      .range([chartHeight, 0]);

    // getting a line
    const line = d3
      .line()
      .x((d) => xScale(+d.Year))
      .y((d) => yScale(+d["Kilotons of Co2"]))
      .curve(d3.curveMonotoneX);

    // getting the path
    g.append("path")
      .datum(countryData)
      .attr("fill", "none")
      .attr("stroke", "#004d40")
      .attr("stroke-width", 2)
      .attr("d", line);

    // x axis and labels
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(4).tickFormat(d3.format("d")));
    
    // AI: information in citations under tick_formatting
    // y-axis and labels, reformatting for easier reading
    g.append("g").call(
      d3
        .axisLeft(yScale)
        .ticks(3)
        .tickFormat((d) => {
          if (d >= 1e6) return `${d / 1e6}M`;
          if (d >= 1e3) return `${d / 1e3}K`;
          return d;
        }),
    );
  }

  // function to switch the map from one dataset/colorscale to another
  function updateMap(metric) {
    const scale =
      colorScales[metric === "Metric Tons Per Capita" ? "perCapita" : "total"];
    svg
      .selectAll("path")
      .attr("fill", (d) => {
        const value =
          emissionsByCountry[d.properties.name]?.[
            metric === "Metric Tons Per Capita" ? "perCapita" : "total"
          ];
        return value ? scale(value) : "#ffffff";
      })
      .attr("orig-fill", (d) => {
        const value =
          emissionsByCountry[d.properties.name]?.[
            metric === "Metric Tons Per Capita" ? "perCapita" : "total"
          ];
        return value ? scale(value) : "#ffffff";
      });
  }

  // create the map
  svg
    .selectAll("path")
    .data(geoData.features)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const emission = emissionsByCountry[d.properties.name]?.total;
      return emission ? colorScales.total(emission) : "#cccccc";
    })
    .attr("orig-fill", (d) => {
      const emission = emissionsByCountry[d.properties.name]?.total;
      return emission ? colorScales.total(emission) : "#cccccc";
    })
    .attr("stroke", "#333")
    .on("mouseover", function (event, d) {
      const countryData = emissionsByCountry[d.properties.name];
      const total = countryData?.total
        ? countryData.total.toLocaleString()
        : "No data";
      const perCapita = countryData?.perCapita
        ? countryData.perCapita.toFixed(2)
        : "No data";

      // show tooltip with country info
      // AI: information under tooltip in citations
      d3.select("#tooltip")
        .classed("hidden", false)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);

      d3.select("#tooltip").selectAll("div").remove();
      d3.select("#tooltip")
        .append("div")
        .html(
          `<strong>${d.properties.name}</strong><br>` +
            `Total: ${total} kilotons<br>` +
            `Per Capita: ${perCapita} metric tons`,
        );

      // create the chart
      createLineChart(d.properties.name);

      // hover fill
      d3.select(this).attr("fill", "#ffcc00");
    })
    .on("mousemove", function (event) {
      d3.select("#tooltip")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    })
    .on("mouseout", function () {
      d3.select("#tooltip").classed("hidden", true);
      d3.select(this).attr("fill", d3.select(this).attr("orig-fill"));
    });

  setupScrollama();

  // event listener for dropdown change
  metricSelect.on("change", function () {
    updateMap(this.value);
  });
});

// zoom function for steps
function zoomTo(stepIndex) {
  projection
    .scale(zoomCoordinates[stepIndex].scale)
    .translate(zoomCoordinates[stepIndex].translate);

  svg.selectAll("path").transition().duration(1400).attr("d", path);

  textBox
    .style("opacity", 1)
    .style("transform", "translate(-50%, 0)")
    .text(stepTexts[stepIndex]);

  // update progress bar
  const progress = ((stepIndex + 1) / stepTexts.length) * 100;
  progressBar.style("width", `${progress}%`);

  // hide progress bar and show dropdown at the last step
  if (stepIndex === stepTexts.length - 1) {
    progressBar.style("display", "none");
    dropdownContainer.style("display", "block");
  } else {
    progressBar.style("display", "block");
    dropdownContainer.style("display", "none");
  }
}

// hide text box on step exit
function hideTextBox() {
  textBox.style("opacity", 0).style("transform", "translate(-50%, 50px)");
}

// AI: information regarding this can be found under scrollama in citations
// scrollama setup
function setupScrollama() {
  scroller
    .setup({
      step: ".step",
      offset: 0.5,
    })
    .onStepEnter((response) => {
      console.log("Step index:", response.index);
      zoomTo(response.index);
    })
    .onStepExit((response) => {
      hideTextBox();
    });

  window.addEventListener("resize", scroller.resize);
}
