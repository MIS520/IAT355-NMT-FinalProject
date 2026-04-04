async function fetchData() {
  const useCasesLong = await d3.csv("data/IAT355_Final_Proj_Dataset(Uses Cases) - Long.csv", d3.autoType);
  const evidentAIRanks = await d3.csv("data/IAT_355_Final_Proj_Dataset(Evident AI - Oct) - IAT_355_Final_Proj_Dataset(Evident AI - Oct.csv", d3.autoType);
  const financials = await d3.csv("data/IAT_355_Final_Proj_Dataset(Fin - IAT_355_Final_Proj_Dataset(Fin (1).csv", d3.autoType);
  return { useCasesLong, evidentAIRanks, financials };
}

function createViz1(useCasesLong) {
  // Trim whitespace from Region values (CSV has "UK " with trailing space)
  const cleaned = useCasesLong.map((d) => ({ ...d, Region: d.Region.trim() }));

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: 700,
    height: 360,
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

async function init() {
  const { useCasesLong, evidentAIRanks, financials } = await fetchData();
  createViz1(useCasesLong);
}

init();

