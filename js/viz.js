async function fetchData() {
  const useCasesLong = await d3.csv("data/IAT355_Final_Proj_Dataset(Uses Cases) - Long.csv", d3.autoType);
  const useCases = await d3.csv("data/IAT_355_Final_Proj_Dataset(Use Cases).csv", d3.autoType);
  const evidentAIRanks = await d3.csv("data/IAT_355_Final_Proj_Dataset(Evident AI - Oct) - IAT_355_Final_Proj_Dataset(Evident AI - Oct.csv", d3.autoType);
  const financials = await d3.csv("data/IAT_355_Final_Proj_Dataset(Fin - IAT_355_Final_Proj_Dataset(Fin (1).csv", d3.autoType);
  return { useCasesLong, useCases, evidentAIRanks, financials };
}

function createViz1(useCasesLong) {
  const cleaned = useCasesLong.map((d) => ({ ...d, Region: d.Region.trim() }));

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 360,
    padding: { top: 64, bottom: 24 },
    data: { values: cleaned },
    mark: { type: "bar", cornerRadiusTopLeft: 4, cornerRadiusTopRight: 4 },
    encoding: {
      x: {
        field: "Region",
        type: "nominal",
        sort: ["USA", "Europe", "UK", "Canada", "France", "APAC"],
        axis: {
          labelAngle: 0,
          labelColor: "#1F2937",
          titleColor: "#1F2937",
          title: "Region",
          domainColor: "#9CA3AF",
          tickColor: "#9CA3AF",
        },
      },
      y: {
        aggregate: "count",
        title: "Number of AI Use Cases",
        axis: {
          labelColor: "#1F2937",
          titleColor: "#1F2937",
          gridColor: "#E5E7EB",
          domainColor: "#9CA3AF",
          tickColor: "#9CA3AF",
        },
      },
      color: {
        field: "Category",
        type: "nominal",
        scale: {
          domain: [
            "Customer Experience",
            "Productivity & Automation",
            "Operations & Infrastructure",
            "Capital Markets & Research",
            "Risk & Fraud",
          ],
          range: ["#977DFF", "#6B5CE7", "#3A4FE8", "#0033FF", "#0600AB"],
        },
        legend: {
          labelColor: "#1F2937",
          titleColor: "#1F2937",
          title: "AI Category",
          orient: "top",
          columns: 1,
          columnPadding: 0,
          padding: 0,
        },
      },
      tooltip: [
        { field: "Region", type: "nominal" },
        { field: "Category", type: "nominal" },
        { field: "Bank", type: "nominal" },
        { field: "Use Case", type: "nominal" },
        { field: "Internal/External", type: "nominal" },
      ],
    },
    background: "transparent",
    config: {
      view: { stroke: "transparent" },
    },
  };

  vegaEmbed("#viz-1", spec, { actions: false });
}

function createVizRegions(useCases) {
  const cleaned = useCases.map((d) => ({
    ...d,
    Region: d.Region.trim().replace(/[^\x20-\x7E]/g, ""),
  }));

  const regionSort = ["USA", "Europe", "UK", "Canada", "France", "APAC"];
  const categorySort = [
    "Customer Experience",
    "Productivity & Automation",
    "Operations & Infrastructure",
    "Capital Markets & Research",
    "Risk & Fraud",
  ];

  const axisStyle = {
    labelColor: "#1F2937",
    titleColor: "#1F2937",
    domainColor: "#9CA3AF",
    tickColor: "#9CA3AF",
  };

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 300,
    data: { values: cleaned },
    layer: [
      {
        mark: { type: "rect", cornerRadius: 6 },
        encoding: {
          x: {
            field: "Region",
            type: "nominal",
            sort: regionSort,
            axis: { ...axisStyle, title: "Region", labelAngle: 0 },
          },
          y: {
            field: "Category",
            type: "nominal",
            sort: categorySort,
            axis: { ...axisStyle, title: null },
          },
          color: {
            aggregate: "count",
            type: "quantitative",
            scale: { range: ["#DDD8FF", "#6B5CE7", "#0600AB"] },
            legend: {
              labelColor: "#1F2937",
              titleColor: "#1F2937",
              title: "Use Cases",
              orient: "top",
              direction: "horizontal",
              gradientLength: 120,
            },
          },
          tooltip: [
            { field: "Region", type: "nominal" },
            { field: "Category", type: "nominal" },
            { aggregate: "count", title: "Use Cases", type: "quantitative" },
          ],
        },
      },
      {
        mark: { type: "text", fontSize: 15, fontWeight: "bold" },
        encoding: {
          x: { field: "Region", type: "nominal", sort: regionSort },
          y: { field: "Category", type: "nominal", sort: categorySort },
          text: { aggregate: "count", type: "quantitative" },
          color: {
            condition: { test: "datum['count'] >= 3", value: "white" },
            value: "#1F2937",
          },
        },
      },
    ],
    background: "transparent",
    config: {
      view: { stroke: "transparent" },
    },
  };

  vegaEmbed("#viz-regions", spec, { actions: false });
}

function createVizUseCases(useCases) {
  const cleaned = useCases
    .filter((d) => d["Internal/External"])
    .map((d) => ({
      ...d,
      Region: d.Region.trim().replace(/[^\x20-\x7E]/g, ""),
      Bank: d.Bank.trim().replace(/[^\x20-\x7E]/g, ""),
    }));

  const axisStyle = {
    labelColor: "#1F2937",
    titleColor: "#1F2937",
    domainColor: "#9CA3AF",
    tickColor: "#9CA3AF",
  };

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 300,
    data: { values: cleaned },
    mark: { type: "bar", cornerRadiusTopRight: 4, cornerRadiusBottomRight: 4 },
    encoding: {
      y: {
        field: "Category",
        type: "nominal",
        sort: "-x",
        axis: { ...axisStyle, title: null, labelLimit: 200 },
      },
      x: {
        aggregate: "count",
        type: "quantitative",
        title: "Number of Use Cases",
        axis: { ...axisStyle, gridColor: "#E5E7EB" },
      },
      color: {
        field: "Internal/External",
        type: "nominal",
        scale: {
          domain: ["Internal", "External"],
          range: ["#3A4FE8", "#977DFF"],
        },
        legend: {
          labelColor: "#1F2937",
          titleColor: "#1F2937",
          title: "Audience",
          orient: "top",
          direction: "horizontal",
          columnPadding: 16,
          padding: 0,
        },
      },
      tooltip: [
        { field: "Category", type: "nominal" },
        { field: "Internal/External", type: "nominal", title: "Audience" },
        { aggregate: "count", type: "quantitative", title: "Use Cases" },
      ],
    },
    background: "transparent",
    config: {
      view: { stroke: "transparent" },
    },
  };

  vegaEmbed("#viz-usecases", spec, { actions: false });
}

async function init() {
  const { useCasesLong, useCases, evidentAIRanks, financials } = await fetchData();
  createViz1(useCasesLong);
  createVizUseCases(useCases);
  createVizRegions(useCases);
}

init();