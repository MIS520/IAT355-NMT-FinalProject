// const { use } = require("react");

async function fetchData() {
  const useCasesLong = await d3.csv(
    "data/IAT355_Final_Proj_Dataset(Uses Cases) - Long.csv",
    d3.autoType,
  );
  const useCases = await d3.csv(
    "data/IAT_355_Final_Proj_Dataset(Use Cases).csv",
    d3.autoType,
  );
  const evidentAIRanks = await d3.csv(
    "data/IAT_355_Final_Proj_Dataset(Evident AI - Oct) - IAT_355_Final_Proj_Dataset(Evident AI - Oct.csv",
    d3.autoType,
  );
  const financials = await d3.csv(
    "data/IAT_355_Final_Proj_Dataset(Fin - IAT_355_Final_Proj_Dataset(Fin (1).csv",
    d3.autoType,
  );
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

function createVizRadar(evidentAIRanks, financials) {
  const parseNum = (v) =>
    typeof v === "string" ? parseFloat(v.replace(/,/g, "")) : +v;

  // Join financials with AI ranks
  const data = financials
    .map((d) => {
      const rank = evidentAIRanks.find((r) => r.Company === d.Company);
      if (!rank) return null;
      return {
        Company: d.Company,
        Rank: rank["Overall Rank"],
        ROE: parseNum(d["ROE (%)"]),
        CostToIncome: parseNum(d["Cost-To-Income Ratio"]),
        RevGrowth:
          ((parseNum(d["Revenue 2025"]) - parseNum(d["Revenue 2022"])) /
            parseNum(d["Revenue 2022"])) *
          100,
      };
    })
    .filter(
      (d) =>
        d && !isNaN(d.ROE) && !isNaN(d.CostToIncome) && !isNaN(d.RevGrowth),
    );

  const avg = (arr, key) => arr.reduce((s, d) => s + d[key], 0) / arr.length;

  const tiers = [
    {
      label: "Top AI (Rank 1–5)",
      color: "#0033FF",
      banks: data.filter((d) => d.Rank <= 5),
    },
    {
      label: "Mid AI (Rank 6–10)",
      color: "#977DFF",
      banks: data.filter((d) => d.Rank >= 6 && d.Rank <= 10),
    },
    {
      label: "Lower AI (Rank 11–15)",
      color: "#b6c1f1",
      banks: data.filter((d) => d.Rank >= 11),
    },
  ];

  const groups = tiers.map((t) => ({
    label: t.label,
    color: t.color,
    values: {
      "ROE (%)": avg(t.banks, "ROE"),
      "Rev. Growth (%)": avg(t.banks, "RevGrowth"),
      Efficiency: 100 - avg(t.banks, "CostToIncome"),
    },
  }));

  const axes = ["ROE (%)", "Rev. Growth (%)", "Efficiency"];

  const maxVals = {};
  axes.forEach((a) => {
    maxVals[a] = Math.max(...groups.map((g) => g.values[a])) * 1.2;
  });

  const W = 780,
    H = 680,
    cx = W / 2,
    cy = H / 2 + 10,
    R = 250,
    levels = 4;
  const angleFor = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;

  const container = d3.select("#viz-radar").style("position", "relative");
  const svg = container
    .append("svg")
    .attr("width", W)
    .attr("height", H + 80);

  // Tooltip div
  const tooltip = container
    .append("div")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("display", "none")
    .style("background", "#060d29")
    .style("color", "#f3f8fc")
    .style("font-size", "13px")
    .style("padding", "8px 12px")
    .style("border-radius", "8px")
    .style("line-height", "1.6")
    .style("white-space", "nowrap")
    .style("box-shadow", "0 4px 12px rgba(6,13,41,0.15)");

  // Concentric level rings
  for (let l = 1; l <= levels; l++) {
    const r = (l / levels) * R;
    const pts = axes
      .map((_, i) => {
        const a = angleFor(i);
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      })
      .join(" ");
    svg
      .append("polygon")
      .attr("points", pts)
      .attr("fill", l % 2 === 0 ? "#f5f6ff" : "none")
      .attr("stroke", "#dde2f8")
      .attr("stroke-width", 1);
  }

  // Axis lines + labels
  axes.forEach((axis, i) => {
    const a = angleFor(i);
    const x2 = cx + R * Math.cos(a),
      y2 = cy + R * Math.sin(a);
    svg
      .append("line")
      .attr("x1", cx)
      .attr("y1", cy)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("stroke", "#b6c1f1")
      .attr("stroke-width", 1.5);

    const lr = R + 36;
    const lx = cx + lr * Math.cos(a),
      ly = cy + lr * Math.sin(a);
    const anchor =
      Math.abs(Math.cos(a)) < 0.1
        ? "middle"
        : Math.cos(a) > 0
          ? "start"
          : "end";
    const baseline =
      Math.sin(a) > 0.2 ? "hanging" : Math.sin(a) < -0.2 ? "auto" : "middle";
    svg
      .append("text")
      .attr("x", lx)
      .attr("y", ly)
      .attr("text-anchor", anchor)
      .attr("dominant-baseline", baseline)
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("fill", "#060d29")
      .text(axis);
  });

  // Precompute all points per group
  const groupPoints = groups.map((g) => ({
    ...g,
    pts: axes.map((axis, i) => {
      const r = (g.values[axis] / maxVals[axis]) * R;
      const a = angleFor(i);
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    }),
  }));

  // Draw all polygons first (back to front)
  [...groupPoints].reverse().forEach((g) => {
    svg
      .append("polygon")
      .attr("points", g.pts.map((p) => p.join(",")).join(" "))
      .attr("fill", g.color)
      .attr("fill-opacity", 0.18)
      .attr("stroke", g.color)
      .attr("stroke-width", 2.5)
      .attr("stroke-linejoin", "round");
  });

  // Draw all dots on top so every group is hoverable
  groupPoints.forEach((g) => {
    g.pts.forEach(([px, py], i) => {
      const axis = axes[i];
      const val = g.values[axis];
      svg
        .append("circle")
        .attr("cx", px)
        .attr("cy", py)
        .attr("r", 6)
        .attr("fill", g.color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mousemove", (event) => {
          tooltip
            .style("display", "block")
            .style("left", event.offsetX + 14 + "px")
            .style("top", event.offsetY - 10 + "px")
            .html(
              `<strong style="color:${g.color}">${g.label}</strong><br/>${axis}: <strong>${val.toFixed(1)}%</strong>`,
            );
        })
        .on("mouseleave", () => tooltip.style("display", "none"));
    });
  });

  // Legend
  const legendW = groups.length * 180;
  const legend = svg
    .append("g")
    .attr("transform", `translate(${(W - legendW) / 2}, ${H + 8})`);
  groups.forEach((g, i) => {
    const row = legend
      .append("g")
      .attr("transform", `translate(${i * 180}, 0)`);
    row
      .append("rect")
      .attr("width", 14)
      .attr("height", 14)
      .attr("rx", 3)
      .attr("fill", g.color)
      .attr("fill-opacity", 0.85);
    row
      .append("text")
      .attr("x", 20)
      .attr("y", 11)
      .attr("font-size", "13px")
      .attr("fill", "#060d29")
      .text(g.label);
  });

  // Annotation card
  container
    .append("div")
    .style("margin-top", "20px")
    .style("width", W + "px")
    .style("background", "#eef0fc")
    .style("border", "1px solid #b6c1f1")
    .style("border-radius", "14px")
    .style("padding", "16px 20px")
    .style("box-sizing", "border-box").html(`
      <div style="font-size:13px; font-weight:700; color:#3054f1; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:6px;">How to read this</div>
      <div style="font-size:13px; color:#324ab3; line-height:1.65;">
        Each axis represents a financial metric: <span style="color:#060d29; font-weight:500;">ROE</span>, <span style="color:#060d29; font-weight:500;">Revenue Growth</span>, and <span style="color:#060d29; font-weight:500;">Efficiency</span> (lower cost-to-income = higher score).<br/>
        A <span style="color:#060d29; font-weight:500;">larger polygon area</span> means stronger overall performance.<br/>
        Banks are grouped by their <span style="color:#060d29; font-weight:500;">Evident AI Maturity Rank</span>. Hover the dots to explore each metric.
      </div>
    `);
}

function createViz3(evidentAIRanks, financials) {
  const joined = evidentAIRanks
    .filter((d) => d["Overall Rank"] <= 15)
    .map((d) => {
      const fin = financials.find((f) => f.Company === d.Company);
      if (!fin) return null;
      const revenue =
        typeof fin["Total Revenue"] === "string"
          ? parseFloat(fin["Total Revenue"].replace(/,/g, ""))
          : fin["Total Revenue"];
      return {
        Company: d.Company,
        AIRank: d["Overall Rank"],
        ROE: fin["ROE (%)"],
        TotalRevenue: revenue,
      };
    })
    .filter(Boolean);

  const axisStyle = {
    labelColor: "#060d29",
    titleColor: "#060d29",
    gridColor: "#dde2f8",
    domainColor: "#b6c1f1",
    tickColor: "#b6c1f1",
  };

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: 700,
    height: 420,
    data: { values: joined },
    layer: [
      {
        mark: {
          type: "rule",
          color: "#b6c1f1",
          strokeWidth: 1.5,
          strokeDash: [4, 3],
        },
        transform: [
          { joinaggregate: [{ op: "mean", field: "ROE", as: "meanROE" }] },
        ],
        encoding: {
          x: { field: "meanROE", type: "quantitative" },
        },
      },
      {
        mark: {
          type: "text",
          color: "#324ab3",
          fontSize: 11,
          align: "left",
          dx: 4,
          fontStyle: "italic",
        },
        transform: [
          { joinaggregate: [{ op: "mean", field: "ROE", as: "meanROE" }] },
          { filter: "datum.AIRank === 15" },
        ],
        encoding: {
          x: { field: "meanROE", type: "quantitative" },
          y: {
            field: "AIRank",
            type: "quantitative",
            scale: { reverse: true, domainMin: 0, domainMax: 20 },
          },
          text: { value: "Average" },
        },
      },
      {
        params: [
          {
            name: "grid",
            select: "interval",
            bind: "scales",
          },
          {
            name: "hover",
            select: { type: "point", on: "mouseover", clear: "mouseout" },
          },
          {
            name: "select",
            select: "point",
          },
        ],
        mark: { type: "point", filled: true, cursor: "pointer" },
        encoding: {
          x: {
            field: "ROE",
            type: "quantitative",
            title: "Return On Equity (%)",
            axis: { ...axisStyle },
          },
          y: {
            field: "AIRank",
            type: "quantitative",
            title: "AI Maturity Rank",
            scale: { reverse: true, domainMin: 0, domainMax: 20 },
            axis: { ...axisStyle },
          },
          size: {
            field: "TotalRevenue",
            type: "quantitative",
            scale: { range: [40, 900] },
            legend: null,
          },
          color: {
            condition: [
              { param: "select", empty: false, value: "#ff6b35" },
              { param: "hover", empty: false, value: "#5e72f0" },
            ],
            value: "#3A4FE8",
          },
          opacity: {
            condition: [
              { param: "select", empty: false, value: 1 },
              { param: "hover", empty: false, value: 1 },
            ],
            value: 0.35,
          },
          stroke: {
            condition: [
              { param: "select", empty: false, value: "#ff6b35" },
              { param: "hover", empty: false, value: "#324ab3" },
            ],
            value: "transparent",
          },
          strokeWidth: {
            condition: [
              { param: "select", empty: false, value: 2.5 },
              { param: "hover", empty: false, value: 1.5 },
            ],
            value: 0,
          },
          tooltip: [
            { field: "Company", type: "nominal", title: "Bank" },
            {
              field: "AIRank",
              type: "quantitative",
              title: "AI Maturity Rank",
            },
            {
              field: "ROE",
              type: "quantitative",
              title: "ROE (%)",
              format: ".2f",
            },
            {
              field: "TotalRevenue",
              type: "quantitative",
              title: "Total Revenue (USD)",
              format: ",.0f",
            },
          ],
        },
      },
      {
        mark: {
          type: "text",
          align: "left",
          dx: 14,
          fontSize: 11,
          fontWeight: 300,
        },
        encoding: {
          x: { field: "ROE", type: "quantitative" },
          y: {
            field: "AIRank",
            type: "quantitative",
            scale: { reverse: true, domainMin: 0, domainMax: 20 },
          },
          text: { field: "Company", type: "nominal" },
          color: {
            condition: [
              { param: "select", empty: false, value: "#ff6b35" },
              { param: "hover", empty: false, value: "#060d29" },
            ],
            value: "#9aa3cc",
          },
          opacity: {
            condition: [
              { param: "select", empty: false, value: 1 },
              { param: "hover", empty: false, value: 1 },
            ],
            value: 0.4,
          },
          fontWeight: {
            condition: { param: "select", empty: false, value: "bold" },
            value: 300,
          },
        },
      },
    ],
    background: "transparent",
    config: { view: { stroke: "transparent" } },
  };

  vegaEmbed("#viz-3", spec, { actions: false }).then(({ view }) => {
    const card = document.getElementById("viz-3-info-card");

    function formatRevenue(v) {
      if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
      if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
      return `$${v.toLocaleString()}`;
    }

    function renderCard(d) {
      if (!d || !d.Company) {
        card.innerHTML = `
          <div style="font-size:13px; font-weight:700; color:#3054f1; letter-spacing:0.06em; text-transform:uppercase;">Bank Details</div>
          <div style="font-size:13px; color:#b6c1f1; line-height:1.65; margin-top:4px;">Hover or click a bank to explore its details.</div>`;
        return;
      }
      card.innerHTML = `
        <div style="font-size:13px; font-weight:700; color:#3054f1; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:4px;">Bank Details</div>
        <div style="font-size:20px; font-weight:500; color:#060d29; line-height:1.2;">${d.Company}</div>
        <hr style="border:none; border-top:1px solid #b6c1f1; margin:4px 0;"/>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:4px;">
          <div>
            <div style="font-size:11px; font-weight:700; color:#3054f1; letter-spacing:0.06em; text-transform:uppercase;">AI Maturity Rank</div>
            <div style="font-size:22px; font-weight:500; color:#060d29;">#${d.AIRank}</div>
          </div>
          <div>
            <div style="font-size:11px; font-weight:700; color:#3054f1; letter-spacing:0.06em; text-transform:uppercase;">Return on Equity</div>
            <div style="font-size:22px; font-weight:500; color:#060d29;">${Number(d.ROE).toFixed(2)}%</div>
          </div>
          <div>
            <div style="font-size:11px; font-weight:700; color:#3054f1; letter-spacing:0.06em; text-transform:uppercase;">Total Revenue</div>
            <div style="font-size:22px; font-weight:500; color:#060d29;">${formatRevenue(d.TotalRevenue)}</div>
          </div>
        </div>`;
    }

    let selected = null;

    view.addEventListener("mouseover", (_, item) => {
      if (item && item.datum && item.datum.Company) renderCard(item.datum);
    });

    view.addEventListener("mouseout", (_, item) => {
      if (item && item.datum && item.datum.Company) renderCard(selected);
    });

    view.addEventListener("click", (_, item) => {
      if (item && item.datum && item.datum.Company) {
        selected =
          selected && selected.Company === item.datum.Company
            ? null
            : item.datum;
        renderCard(selected);
      }
    });
  });
}

async function createVizWorldMap(useCases) {
  const cleaned = useCases.map((d) => ({
    ...d,
    Region: d.Region.trim().replace(/[^\x20-\x7E]/g, ""),
  }));

  const regionCounts = {};
  cleaned.forEach((d) => {
    if (d.Region) regionCounts[d.Region] = (regionCounts[d.Region] || 0) + 1;
  });

  const countryToRegion = {
    840: "USA",
    124: "Canada",
    826: "UK",
    250: "France",
    276: "Europe",
    724: "Europe",
    380: "Europe",
    528: "Europe",
    756: "Europe",
    752: "Europe",
    56: "Europe",
    40: "Europe",
    208: "Europe",
    578: "Europe",
    246: "Europe",
    620: "Europe",
    372: "Europe",
    703: "Europe",
    705: "Europe",
    191: "Europe",
    348: "Europe",
    616: "Europe",
    392: "APAC",
    156: "APAC",
    36: "APAC",
    702: "APAC",
    410: "APAC",
    356: "APAC",
    554: "APAC",
    764: "APAC",
    458: "APAC",
  };

  const regionLabelCoords = {
    USA: [-100, 38],
    Canada: [-96, 57],
    UK: [-2, 54],
    France: [2.5, 46.5],
    Europe: [18, 50],
    APAC: [118, 22],
  };

  const width = 1100,
    height = 560;
  const baseScale = 260;
  const maxCount = Math.max(...Object.values(regionCounts));

  const container = d3
    .select("#viz-map")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("gap", "12px");
  container.selectAll("*").remove();
  d3.select("body").selectAll(".map-tooltip").remove();

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border-radius", "12px")
    .style("cursor", "grab")
    .style("display", "block")
    .style("background", "#060d29");

  const projection = d3
    .geoOrthographic()
    .scale(baseScale)
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .rotate([-20, -30]);

  const path = d3.geoPath().projection(projection);

  const colorScale = d3
    .scaleLinear()
    .domain([0, maxCount])
    .range(["#977DFF", "#0600AB"]);

  // Globe glow effect
  const defs = svg.append("defs");
  const glowGrad = defs.append("radialGradient").attr("id", "globe-glow");
  glowGrad
    .append("stop")
    .attr("offset", "85%")
    .attr("stop-color", "#e8ecfd")
    .attr("stop-opacity", 0);
  glowGrad
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#3054f1")
    .attr("stop-opacity", 0.5);

  const shadowGrad = defs
    .append("radialGradient")
    .attr("id", "globe-shadow")
    .attr("cx", "65%")
    .attr("cy", "35%");
  shadowGrad
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#ffffff")
    .attr("stop-opacity", 0.1);
  shadowGrad
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#060d29")
    .attr("stop-opacity", 0.3);

  // Atmosphere ring
  svg
    .append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", baseScale + 6)
    .attr("fill", "none")
    .attr("stroke", "#977DFF")
    .attr("stroke-width", 10)
    .attr("stroke-opacity", 0.2);

  // Ocean sphere
  const sphereEl = svg
    .append("path")
    .datum({ type: "Sphere" })
    .attr("fill", "#e8ecfd")
    .attr("stroke", "none");

  // Graticule
  const graticule = d3.geoGraticule();
  const graticuleEl = svg
    .append("path")
    .datum(graticule())
    .attr("fill", "none")
    .attr("stroke", "#b6c1f1")
    .attr("stroke-width", 0.35)
    .attr("stroke-opacity", 0.7);

  const world = await d3.json(
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
  );
  const countries = topojson.feature(world, world.objects.countries);

  const hasData = (d) => {
    const region = countryToRegion[+d.id];
    return region && regionCounts[region] > 0;
  };

  // Countries
  const countryEls = svg
    .selectAll("path.country")
    .data(countries.features)
    .join("path")
    .attr("class", "country")
    .attr("fill", (d) =>
      hasData(d) ? colorScale(regionCounts[countryToRegion[+d.id]]) : "#3a4060",
    )
    .attr("stroke", (d) => (hasData(d) ? "#f3f8fc" : "#2a2f50"))
    .attr("stroke-width", 0.4)
    .attr("stroke-linejoin", "round")
    .style("cursor", (d) => (hasData(d) ? "pointer" : "default"));

  // Specular highlight overlay
  svg
    .append("path")
    .datum({ type: "Sphere" })
    .attr("fill", "url(#globe-shadow)")
    .attr("pointer-events", "none");

  // Glow ring overlay
  svg
    .append("path")
    .datum({ type: "Sphere" })
    .attr("fill", "url(#globe-glow)")
    .attr("pointer-events", "none");

  countryEls
    .on("mousemove", function (_event, d) {
      if (!hasData(d)) return;
      const region = countryToRegion[+d.id];
      const count = regionCounts[region];
      d3.select(this).attr("stroke", "#977DFF").attr("stroke-width", 1.8);
      infoPanel.html(
        `<strong style="color:#f3f8fc">${region}</strong> &nbsp;·&nbsp; ${count} AI Use Cases`,
      );
    })
    .on("mouseleave", function (_event, d) {
      d3.select(this)
        .attr("stroke", hasData(d) ? "#f3f8fc" : "#2a2f50")
        .attr("stroke-width", 0.4);
      infoPanel.html(defaultInfo);
    });

  // Region label badges — repositioned on each render
  const labelsData = Object.entries(regionLabelCoords)
    .filter(([r]) => regionCounts[r])
    .map(([region, coords]) => ({
      region,
      coords,
      label: `${region}: ${regionCounts[region]}`,
      badgeW: `${region}: ${regionCounts[region]}`.length * 6 + 14,
    }));

  const labelEls = svg
    .selectAll("g.region-label")
    .data(labelsData)
    .join("g")
    .attr("class", "region-label")
    .attr("pointer-events", "none");

  labelEls.each(function (d) {
    const g = d3.select(this);
    const bh = 18;
    g.append("rect")
      .attr("height", bh)
      .attr("rx", bh / 2)
      .attr("fill", "rgba(243,248,252,0.92)")
      .attr("stroke", "#3054f1")
      .attr("stroke-width", 1.2);
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "9.5px")
      .attr("font-weight", "700")
      .attr("fill", "#060d29")
      .attr("y", 13)
      .text(d.label);
  });

  // Below-globe panel: legend + hover info + controls hint
  const defaultInfo = `<span style="color:#b6c1f1">Hover a country to see region details</span>`;

  const belowPanel = container
    .append("div")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "space-between")
    .style("gap", "16px")
    .style("padding", "10px 16px")
    .style("background", "#060d29")
    .style("border-radius", "10px")
    .style("width", `${width}px`)
    .style("box-sizing", "border-box");

  // Left: gradient legend
  const legendDiv = belowPanel
    .append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("gap", "4px")
    .style("flex-shrink", "0");

  legendDiv
    .append("div")
    .style("width", "120px")
    .style("height", "8px")
    .style("border-radius", "4px")
    .style("background", "linear-gradient(to right, #977DFF, #0600AB)");

  legendDiv
    .append("div")
    .style("display", "flex")
    .style("justify-content", "space-between")
    .style("font-size", "10px")
    .style("color", "#b6c1f1")
    .html("<span>Fewer</span><span>More AI Use Cases</span>");

  // Center: hover info
  const infoPanel = belowPanel
    .append("div")
    .style("font-size", "13px")
    .style("color", "#f3f8fc")
    .style("text-align", "center")
    .style("flex", "1")
    .html(defaultInfo);

  // Right: controls hint
  belowPanel
    .append("div")
    .style("font-size", "10.5px")
    .style("color", "#b6c1f1")
    .style("text-align", "right")
    .style("flex-shrink", "0")
    .html("Drag to rotate<br>Scroll to zoom<br>Dbl-click to reset");

  function render() {
    // Update sphere, graticule, countries
    sphereEl.attr("d", path);
    graticuleEl.attr("d", path);
    countryEls.attr("d", path);

    // Re-position specular/glow overlays (they're spheres, always same shape)
    svg
      .selectAll(
        "path[fill='url(#globe-shadow)'], path[fill='url(#globe-glow)']",
      )
      .attr("d", path);

    // Reposition atmosphere ring to match current scale
    svg.select("circle").attr("r", projection.scale() + 6);

    // Update label positions — hide if on the back of the globe
    labelEls.each(function (d) {
      const projected = projection(d.coords);
      const g = d3.select(this);
      if (!projected) {
        g.style("display", "none");
      } else {
        g.style("display", null).attr(
          "transform",
          `translate(${projected[0] - d.badgeW / 2},${projected[1] - 9})`,
        );
        g.select("rect").attr("width", d.badgeW);
        g.select("text").attr("x", d.badgeW / 2);
      }
    });
  }

  render();

  // Drag to rotate
  const drag = d3
    .drag()
    .on("start", () => {
      svg.style("cursor", "grabbing");
      tooltip.style("display", "none");
    })
    .on("drag", (event) => {
      const [λ, φ] = projection.rotate();
      projection.rotate([
        λ + event.dx * 0.4,
        Math.max(-90, Math.min(90, φ - event.dy * 0.4)),
      ]);
      render();
    })
    .on("end", () => svg.style("cursor", "grab"));

  svg.call(drag);

  // Scroll to zoom
  svg.on(
    "wheel.zoom",
    (event) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.08 : 0.93;
      projection.scale(
        Math.max(100, Math.min(600, projection.scale() * factor)),
      );
      render();
    },
    { passive: false },
  );

  // Double-click to reset
  svg.on("dblclick", () => {
    projection.rotate([-20, -30]).scale(baseScale);
    render();
  });
}

function initCarousel() {
  const el = document.getElementById("category-carousel");
  const heading = document.getElementById("carousel-heading");
  if (!el || !heading) return;

  const alignPadding = () => {
    const left = heading.getBoundingClientRect().left;
    el.style.paddingLeft = left + "px";
  };
  alignPadding();
  window.addEventListener("resize", alignPadding);

  let isDown = false,
    startX,
    scrollLeft;
  el.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX;
    scrollLeft = el.scrollLeft;
  });
  el.addEventListener("mouseleave", () => (isDown = false));
  el.addEventListener("mouseup", () => (isDown = false));
  el.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    el.scrollLeft = scrollLeft - (e.pageX - startX);
  });
}

var selectedBank = null;

async function createUseCaseBar(useCases, updatePie) {
  // set the dimensions and margins of the graph
  const margin = { top: 30, right: 30, bottom: 100, left: 60 },
    width = 720 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select("#use-case-bar")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const useCaseCounts = d3.rollup(
    useCases,
    (v) => v.length, // Reducer: returns the count of rows in the group
    (d) => d.Bank, // Key: the column to group by
  );
  console.log(useCaseCounts);

  const plotData = Array.from(useCaseCounts, ([key, value]) => ({
    key,
    value,
  })).sort((a, b) => b.value - a.value);

  // X axis
  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(plotData.map((d) => d.key))
    .padding(0.2);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 5]).range([height, 0]);

  svg.append("g").call(d3.axisLeft(y));

  // Bars
  svg
    .selectAll("mybar")
    .data(plotData)
    .join("rect")
    .attr("x", (d) => x(d.key))
    .attr("y", (d) => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.value))
    .attr("fill", "#B6C1F1")
    // .attr("hover", "fill", "#B6C1F1")
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration(150).style("fill", "#3054F1");
    })
    .on("mouseleave", function (event, d) {
      if (d.key !== selectedBank) {
        d3.select(this).transition().duration(200).style("fill", "#B6C1F1");
      }
    })
    .on("click", function (event, d) {
      selectedBank = d.key;
      updatePie(d.key); // d.key is the bank name
      console.log(d.key);

      svg.selectAll("rect").style("fill", "#B6C1F1");
      d3.select(this).style("fill", "#3054F1");
    });

  // Add X axis label:
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + 50)
    .text("Financial Institutions");

  // Y axis label:
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", 0)
    .text("Number of AI Use Cases");

  // title
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width * 0.8)
    .attr("y", -10)
    .text("How many AI Use Cases are in Each Bank?")
    .style("font-weight", "700")
    .style("font-size", "20px");
}

async function createUseCasePie(useCases) {
  const margin = { top: 200, right: 30, bottom: 100, left: 200 },
    width = 350 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const r = height * 2.5 - 10; // radius constant
  const color = d3
    .scaleOrdinal()
    .domain(["Internal", "External"])
    .range(["#B6C1F1", "#3054F1"]);

  const svg = d3
    .select("#use-case-pie")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const arc = d3
    .arc()
    .innerRadius(r * 0.2)
    .outerRadius(r * 0.6);

  const pie = d3
    .pie()
    .sort(null)
    .value((d) => d.value);

  function getStartingData() {
    const counts = d3.rollup(
      useCases,
      (v) => v.length, // Reducer: returns the count of rows in the group
      (d) => d["Internal/External"], // Key: the column to group by
    );

    return Array.from(counts, ([key, value]) => ({ key, value }));
  }

  function getBankData(bankName) {
    const filtered = useCases.filter((d) => d.Bank === bankName);
    const counts = d3.rollup(
      filtered,
      (v) => v.length,
      (d) => d["Internal/External"],
    );
    return Array.from(counts, ([key, value]) => ({ key, value }));
  }

  let paths = svg
    .selectAll("path")
    .data(pie(getStartingData()))
    .join("path")
    .attr("fill", (d) => color(d.data.key))
    .attr("d", arc)
    .each(function (d) {
      this._current = d;
    });

  function arcTween(a) {
    const i = d3.interpolate(this._current, a);
    this._current = i(0);
    return (t) => arc(i(t));
  }

  function updatePie(bankName) {
    const newData = bankName ? getBankData(bankName) : getStartingData();

    // update title
    svg.select("text.pie-title").text(bankName ? bankName : "All Banks");

    paths = svg
      .selectAll("path")
      .data(pie(newData))
      .join("path")
      .attr("fill", (d) => color(d.data.key))
      .each(function (d) {
        if (!this._current) this._current = d;
      })
      .transition()
      .duration(750)
      .attrTween("d", arcTween);

    updateLabels(newData);
  }

  function updateLabels(data) {
    svg
      .selectAll("text.slice-label")
      .data(pie(data))
      .join("text")
      .attr("class", "slice-label")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .style("fill", (d) => (d.data.key === "External" ? "#F3F8FC" : "#060d29"))
      .style("font-weight", "700")
      .each(function (d) {
        const pct = Math.round(
          ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100,
        );
        d3.select(this).selectAll("tspan").remove();
        d3.select(this)
          .append("tspan")
          .attr("x", 0)
          .attr("dy", 0)
          .text(d.data.key);

        d3.select(this)
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1.2em")
          .text(`${pct}%`);
      });
  }

  updateLabels(getStartingData());

  // legend
  // svg
  //   .append("circle")
  //   .attr("cx", 200)
  //   .attr("cy", -140)
  //   .attr("r", 6)
  //   .style("fill", "#B6C1F1");
  // svg
  //   .append("circle")
  //   .attr("cx", 200)
  //   .attr("cy", -110)
  //   .attr("r", 6)
  //   .style("fill", "#3054F1");
  // svg
  //   .append("text")
  //   .attr("x", 220)
  //   .attr("y", -140)
  //   .text("Internal")
  //   .style("font-size", "15px")
  //   .attr("alignment-baseline", "middle");
  // svg
  //   .append("text")
  //   .attr("x", 220)
  //   .attr("y", -110)
  //   .text("External")
  //   .style("font-size", "15px")
  //   .attr("alignment-baseline", "middle");

  // title
  svg
    .append("text")
    .attr("class", "pie-title")
    .attr("text-anchor", "middle")
    .attr("x", 0)
    .attr("y", -175)
    .text("All Banks")
    .style("font-weight", "700")
    .style("font-size", "20px");

  return { updatePie };
}

async function init() {
  const { useCases, evidentAIRanks, financials } = await fetchData();
  // createVizRegions(useCases);
  createVizWorldMap(useCases);
  createVizRadar(evidentAIRanks, financials);
  // createViz3(evidentAIRanks, financials);
  // createUseCaseBar(useCases);
  // createUseCasePie(useCases);
  // initCarousel();

  // const { useCases } = await fetchData();
  const { updatePie } = await createUseCasePie(useCases); // get the update function
  createUseCaseBar(useCases, updatePie); // pass it to bar chart
}

init();
