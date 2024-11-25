const scroller = scrollama();

// initialize map and its measurements
const svg = d3.select("#map");
const width = +svg.attr("width");
const height = +svg.attr("height");

const projection = d3
  .geoMercator()
  .scale(250)
  .translate([width / 2, height / 1.4]);
const path = d3.geoPath().projection(projection);

let geoData, emissionsData;

// texts for each step in the story
const stepTexts = [
  "Why CO2 emissions matter and the focus on 2019 as a benchmark year.",
  "Overview of global CO2 emissions in 2019 with notable outliers.",
  "Key contributors: US, China, the EU, and India.",
  "Regional disparities between developed and developing nations.",
  "Sectoral contributions to emissions (if data permits).",
  "Policy snapshots: impactful efforts vs. challenges in 2019.",
  "Emissions and equity: per capita and GDP influences.",
  "Challenges and opportunities for global cooperation.",
];

// coordinates for the map zoom for each step
const zoomCoordinates = [
  { scale: 250, translate: [width / 2, height / 1.4] }, // global
  { scale: 250, translate: [width / 2, height / 1.4] }, // global trends
  { scale: 1000, translate: [2500, 1250] }, // US
  { scale: 700, translate: [400, 600] }, // Africa
  { scale: 500, translate: [0, 900] }, // Asia
  { scale: 250, translate: [width / 2, height / 1.4] }, // narrative placeholder
  { scale: 250, translate: [width / 2, height / 1.4] }, // narrative placeholder
  { scale: 250, translate: [width / 2, height / 1.4] }, // narrative placeholder
];

// text box for transitions
const textBox = d3.select("#text-box");
const tooltip = d3.select("#tooltip");
const dropdownContainer = d3.select("#dropdown-container");
const metricSelect = d3.select("#metric-select");

// promise all because multiple things to load
Promise.all([
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"),
  d3.csv("/../Data/CO2_emissions_2019.csv"),
]).then(([data, emissions]) => {
  geoData = topojson.feature(data, data.objects.countries);

  emissionsData = emissions;

  // creating two datasets as key value pairs
  const emissionsByCountry = {};
  emissionsData.forEach((d) => {
    emissionsByCountry[d.Country] = {
      total: +d["Kilotons of Co2"],
      perCapita: +d["Metric Tons Per Capita"],
    };
  });

  // two color scales for each dataset, these honestly need adjusting
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
      return emission ? colorScales.total(emission) : "#ffffff";
    })
    .attr("orig-fill", (d) => {
      const emission = emissionsByCountry[d.properties.name]?.total;
      return emission ? colorScales.total(emission) : "#ffffff";
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

      d3.select("#tooltip")
        .classed("hidden", false)
        .html(
          `<strong>${d.properties.name}</strong><br>` +
            `Total: ${total} kilotons<br>` +
            `Per Capita: ${perCapita} metric tons`,
        );
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
}

// hide text box on step exit
function hideTextBox() {
  textBox.style("opacity", 0).style("transform", "translate(-50%, 50px)");
}

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
      if (response.index === stepTexts.length - 1) {
        dropdownContainer.style("display", "block");
      } else {
        dropdownContainer.style("display", "none");
      }
    })
    .onStepExit((response) => {
      hideTextBox();

      if (response.index === stepTexts.length - 1) {
        dropdownContainer.style("display", "none");
      }
    });

  window.addEventListener("resize", scroller.resize);
}
