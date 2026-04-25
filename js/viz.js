// const { use } = require("react");

async function fetchData() {
  const useCasesLong = await d3.csv("data/IAT355_Final_Proj_Dataset(Uses Cases) - Long.csv", d3.autoType);
  const useCases = await d3.csv("data/IAT_355_Final_Proj_Dataset(Use Cases).csv", d3.autoType);
  const evidentAIRanks = await d3.csv("data/IAT_355_Final_Proj_Dataset(Evident AI - Oct) - IAT_355_Final_Proj_Dataset(Evident AI - Oct.csv", d3.autoType);
  const financials = await d3.csv("data/IAT_355_Final_Proj_Dataset(Fin - IAT_355_Final_Proj_Dataset(Fin (1).csv", d3.autoType);
  const aiIndustries = await d3.csv("data/IAT_355_Final_Proj_Dataset(AI Use Across Industries).csv", d3.autoType);
  return { useCasesLong, useCases, evidentAIRanks, financials, aiIndustries };
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
          labelColor: "#060d29",
          titleColor: "#060d29",
          title: "Region",
          domainColor: "#b6c1f1",
          tickColor: "#b6c1f1",
        },
      },
      y: {
        aggregate: "count",
        title: "Number of AI Use Cases",
        axis: {
          labelColor: "#060d29",
          titleColor: "#060d29",
          gridColor: "#dde2f8",
          domainColor: "#b6c1f1",
          tickColor: "#b6c1f1",
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
          labelColor: "#060d29",
          titleColor: "#060d29",
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
      axis: { labelFontWeight: 300, titleFontWeight: 300, labelFontSize: 12, titleFontSize: 12 },
      legend: { labelFontWeight: 300, titleFontWeight: 300, labelFontSize: 12 },
    },
  };

  vegaEmbed("#viz-1", spec, { actions: false });
}

function createVizIndustries(aiIndustries) {
  // Remove the aggregate "All businesses" row, we only want individual industry rows
  const cleaned = aiIndustries
    .filter(d => d["% of businesses"] !== "All businesses")
    .map(d => ({
      industry: d["% of businesses"],
      q2024: +d["3rd Quarter of 2024"],
      q2025: +d["3rd Quarter of 2025"],
      // Flag Finance & Insurance so it can be highlighted differently in the chart
      isFinance: d["% of businesses"] === "Finance and insurance",
    }));

  // Pre-compute the y-axis sort order (highest Q3 2025 adoption at the top)
  const sortOrder = [...cleaned]
    .sort((a, b) => b.q2025 - a.q2025)
    .map(d => d.industry);

  // Shared axis styling using the site's design tokens
  const axisStyle = {
    labelColor: "#060d29",
    titleColor: "#060d29",
    domainColor: "#b6c1f1",
    tickColor: "#b6c1f1",
    gridColor: "#dde2f8",
  };

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 440,
    padding: { top: 16, right: 20, bottom: 20, left: 20 },
    data: { values: cleaned },
    transform: [
      // Reshape wide (q2024, q2025) into long format so both years share one x scale
      { fold: ["q2024", "q2025"], as: ["period", "pct"] },
      // Create a human-readable label for the legend ("Q3 2024" / "Q3 2025")
      { calculate: "datum.period === 'q2025' ? 'Q3 2025' : 'Q3 2024'", as: "label" },
    ],
    layer: [
      // Connecting line between the two dots
      {
        mark: { type: "line" },
        encoding: {
          y: {
            field: "industry",
            type: "nominal",
            sort: sortOrder,
            axis: { ...axisStyle, title: null, labelLimit: 290 },
          },
          x: {
            field: "pct",
            type: "quantitative",
            title: "% of businesses using AI",
            axis: { ...axisStyle },
            scale: { zero: true },
          },
          detail: { field: "industry", type: "nominal" },
          color: {
            condition: { test: "datum.isFinance", value: "#977DFF" },
            value: "#dde2f8",
          },
          strokeWidth: {
            condition: { test: "datum.isFinance", value: 3 },
            value: 1.5,
          },
        },
      },
      // Q3 2024 / Q3 2025 dots
      {
        mark: { type: "point", filled: true, size: 72, strokeWidth: 0 },
        encoding: {
          y: { field: "industry", type: "nominal", sort: sortOrder },
          x: { field: "pct", type: "quantitative" },
          color: {
            field: "label",
            type: "nominal",
            scale: {
              domain: ["Q3 2024", "Q3 2025"],
              range: ["#b6c1f1", "#0033FF"],
            },
            legend: {
              title: null,
              orient: "top",
              labelColor: "#060d29",
            },
          },
          opacity: {
            condition: { test: "datum.isFinance", value: 1 },
            value: 0.5,
          },
          tooltip: [
            { field: "industry", type: "nominal", title: "Industry" },
            { field: "label", type: "nominal", title: "Period" },
            { field: "pct", type: "quantitative", title: "% using AI", format: ".1f" },
          ],
        },
      },
      // "Banking" label on Finance & Insurance Q3 2025 dot
      {
        transform: [
          { filter: "datum.industry === 'Finance and insurance' && datum.period === 'q2025'" },
        ],
        mark: { type: "text", align: "left", dx: 8, fontSize: 11, fontStyle: "italic" },
        encoding: {
          y: { field: "industry", type: "nominal", sort: sortOrder },
          x: { field: "pct", type: "quantitative" },
          text: { value: "Banking" },
          color: { value: "#0033FF" },
        },
      },
    ],
    // Each layer uses color differently (condition vs field), so resolve independently
    // to prevent Vega-Lite from trying to merge their color scales into one
    resolve: { scale: { color: "independent" } },
    background: "transparent",
    config: { view: { stroke: "transparent" }, axis: { labelFontWeight: 300, titleFontWeight: 300, labelFontSize: 12, titleFontSize: 12 }, legend: { labelFontWeight: 300, titleFontWeight: 300, labelFontSize: 12 } },
  };

  vegaEmbed("#viz-industries", spec, { actions: false });
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
    labelColor: "#060d29",
    titleColor: "#060d29",
    domainColor: "#b6c1f1",
    tickColor: "#b6c1f1",
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
        axis: { ...axisStyle, gridColor: "#dde2f8" },
      },
      color: {
        field: "Internal/External",
        type: "nominal",
        scale: {
          domain: ["Internal", "External"],
          range: ["#3A4FE8", "#977DFF"],
        },
        legend: {
          labelColor: "#060d29",
          titleColor: "#060d29",
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
      axis: { labelFontWeight: 300, titleFontWeight: 300, labelFontSize: 12, titleFontSize: 12 },
      legend: { labelFontWeight: 300, titleFontWeight: 300, labelFontSize: 12 },
    },
  };

  vegaEmbed("#viz-usecases", spec, { actions: false });
}

function createVizRadar(evidentAIRanks, financials) {
    // Helper to parse numbers that may be stored as comma-formatted strings (e.g. "1,234.5")
  const parseNum = (v) =>
    typeof v === "string" ? parseFloat(v.replace(/,/g, "")) : +v;

  // Join the financials and AI rank datasets on company name, then compute the three metrics
  const data = financials
    .map((d) => {
      const rank = evidentAIRanks.find((r) => r.Company === d.Company);
      if (!rank) return null;
      return {
        Company: d.Company,
        Rank: rank["Overall Rank"],
        ROE: parseNum(d["ROE (%)"]),
        CostToIncome: parseNum(d["Cost-To-Income Ratio"]),
         // Revenue growth = percentage change from 2022 to 2025
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

  // Reusable average helper
  const avg = (arr, key) => arr.reduce((s, d) => s + d[key], 0) / arr.length;

  // Split banks into three AI maturity tiers for comparison
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

  // Average each metric across all banks in a tier to get one polygon per tier
  // Efficiency is inverted: lower cost-to-income ratio = more efficient, so we subtract from 100
  const groups = tiers.map(t => ({
    label: t.label,
    color: t.color,
    values: {
      "ROE (%)": avg(t.banks, "ROE"),
      "Rev. Growth (%)": avg(t.banks, "RevGrowth"),
      Efficiency: 100 - avg(t.banks, "CostToIncome"),
    },
  }));

  const axes = ["ROE (%)", "Rev. Growth (%)", "Efficiency"];

  // Scale each axis independently so the largest value fills the full radius (× 1.2 for padding)
  const maxVals = {};
  axes.forEach((a) => {
    maxVals[a] = Math.max(...groups.map((g) => g.values[a])) * 1.2;
  });

  // Canvas dimensions — cx/cy is the radar centre, R is the outer radius, levels = ring count
  const W = 780, H = 680, cx = W / 2, cy = H / 2 + 10, R = 250, levels = 4;
  // Spread axes evenly around a full circle, starting straight up (−π/2)
  const angleFor = i => -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;

  const container = d3.select("#viz-radar").style("position", "relative");

  const buttons = container
    .append("div")
    .style("display", "flex")
    .style("gap", "8px")
    .style("margin-bottom", "4px");

  buttons
    .append("button")
    .text("All Ranks")
    .style("border", `2px solid black`)
    .style("color", "#000000")
    .on("click", function () {
      tiers.forEach((tier) => {
        const elements = document.querySelectorAll(
          `.tier-${tier.color.replace("#", "")}`,
        );
        elements.forEach((element) => {
          element.style.opacity = 1;
        });
      });
    });

  tiers.forEach((t, i) => {
    buttons
      .append("button")
      .text(t.label)
      .style("border", `2px solid ${t.color}`)
      .style("color", t.color)
      .on("click", function () {
        // loop through ALL tiers
        tiers.forEach((tier) => {
          const elements = document.querySelectorAll(
            `.tier-${tier.color.replace("#", "")}`,
          );
          elements.forEach((element) => {
            // if this tier matches the clicked one, show it, otherwise hide it
            if (tier.color === t.color) {
              element.style.opacity = 1;
            } else {
              element.style.opacity = 0;
            }
          });
        });
      });
  });
  const svg = container.append("svg").attr("width", W).attr("height", H);

  // Tooltip div
  const tooltip = container
    .append("div")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("display", "none")
    .style("background", "#F3F8FC")
    .style("color", "060D29")
    .style("font-size", "13px")
    .style("padding", "8px 12px")
    .style("border-radius", "8px")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-color", "060D29")
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
      .attr("class", `tier-${g.color.replace("#", "")}`)
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
        .attr("class", `tier-${g.color.replace("#", "")}`)
        .attr("cx", px)
        .attr("cy", py)
        .attr("r", 6)
        .attr("fill", g.color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        // .style("cursor", "pointer")
        .on("mousemove", (event) => {
          tooltip
            .style("display", "block")
            .style("border-color", g.color)
            .style("left", event.offsetX + 14 + "px")
            .style("top", event.offsetY - 10 + "px")
            .html(
              `<strong style="color:"#060d29"">${g.label}</strong><br/>${axis}: <strong>${val.toFixed(1)}%</strong>`,
            );
        })
        .on("mouseleave", () => tooltip.style("display", "none"));
    });
  });

  // Legend
  const legendW = groups.length * 180;
  const legend = svg
    .append("g")
    .attr("transform", `translate(${(W - legendW) / 2}, ${H - 90})`);

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
    // .style("margin-top", "20px")
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
  // Join the top 15 AI-ranked banks with their financial data
  // Revenue is stored as a comma-formatted string in some rows, so parse it to a number
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

  // Shared axis styling using the site's design tokens
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
      // Layer 1: vertical dashed rule at the mean ROE across all 15 banks
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
      // Layer 2: "Average" text label pinned to the bottom of the rule (AIRank 15)
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
      // Layer 3: the main scatter bubbles — size = revenue, y-axis reversed so rank 1 is at top
      // Three interactive params: pan/zoom (grid), hover highlight, click-to-select
      {
        params: [
          {
            name: "grid",
            select: "interval",
            bind: "scales",   // binds the interval selection to the axis scales for pan/zoom
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
        mark: { type: "point", filled: true },
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
      // Layer 4: bank name labels — dim by default, full opacity on hover/select
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
    config: { view: { stroke: "transparent" }, axis: { labelFontWeight: 300, titleFontWeight: 300, labelFontSize: 12, titleFontSize: 12 }, legend: { labelFontWeight: 300, titleFontWeight: 300, labelFontSize: 12 } },
  };

  vegaEmbed("#viz-3", spec, { actions: false }).then(({ view }) => {
    const card = document.getElementById("viz-3-info-card");

    // Format large revenue numbers as $XB / $XM for the info card
    function formatRevenue(v) {
      if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
      if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
      return `$${v.toLocaleString()}`;
    }

    // Populate the side card — called with null on load and when hover leaves a selected bank
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
    renderCard(null);  // Show placeholder text on initial load

    // Hover: show hovered bank (falls back to selected on mouseout)
    view.addEventListener("mouseover", (_, item) => {
      if (item && item.datum && item.datum.Company) renderCard(item.datum);
    });

    view.addEventListener("mouseout", (_, item) => {
      if (item && item.datum && item.datum.Company) renderCard(selected);
    });

    // Click: pin a bank's details; clicking the same bank again deselects it
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
  // Strip non-ASCII characters from Region values that can cause lookup mismatches
  const cleaned = useCases.map((d) => ({
    ...d,
    Region: d.Region.trim().replace(/[^\x20-\x7E]/g, ""),
  }));

  // Count total AI use cases per region for the choropleth color scale
  const regionCounts = {};
  cleaned.forEach((d) => {
    if (d.Region) regionCounts[d.Region] = (regionCounts[d.Region] || 0) + 1;
  });

  // Count use cases broken down by category per region — used for the hover tooltip breakdown
  const regionCategoryBreakdown = {};
  cleaned.forEach((d) => {
    if (!d.Region || !d.Category) return;
    if (!regionCategoryBreakdown[d.Region]) regionCategoryBreakdown[d.Region] = {};
    regionCategoryBreakdown[d.Region][d.Category] = (regionCategoryBreakdown[d.Region][d.Category] || 0) + 1;
  });

  // Category colors mirror the other charts so colors are consistent across the whole page
  const categoryColors = {
    "Customer Experience": "#977DFF",
    "Productivity & Automation": "#6B5CE7",
    "Operations & Infrastructure": "#3A4FE8",
    "Capital Markets & Research": "#0033FF",
    "Risk & Fraud": "#0600AB",
  };

  // Maps ISO 3166-1 numeric country IDs (from the world-atlas TopoJSON) to dataset region names
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

  // Search / snap-to input, only regions that have data
  const regionAliases = {
    "USA":    ["United States"],
    "UK":     ["United Kingdom", "England"],
    "Canada": [],
    "France": [],
    "Europe": [],
    "APAC":   [],
  };

  const searchTargets = {};
  Object.entries(regionLabelCoords).forEach(([region, coords]) => {
    if (!regionCounts[region]) return;
    searchTargets[region] = coords;
    (regionAliases[region] || []).forEach(alias => { searchTargets[alias] = coords; });
  });

  const searchWrap = container.append("div")
    .style("display", "flex")
    .style("gap", "8px")
    .style("align-items", "center")
    .style("width", `${width}px`)
    .style("box-sizing", "border-box");

  const searchInput = searchWrap.append("input")
    .attr("type", "text")
    .attr("placeholder", "Snap to region or country… (e.g. Japan, USA, Europe)")
    .attr("list", "globe-search-list")
    .style("flex", "1")
    .style("padding", "8px 14px")
    .style("border-radius", "8px")
    .style("border", "1px solid #3054f1")
    .style("background", "#0d1340")
    .style("color", "#f3f8fc")
    .style("font-size", "13px")
    .style("outline", "none");

  searchWrap.append("datalist")
    .attr("id", "globe-search-list")
    .selectAll("option")
    .data(Object.keys(searchTargets))
    .join("option")
    .attr("value", d => d);

  const svg = container.append("svg")
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

  // Returns true if a country's ISO numeric ID maps to a region that has use-case data
  const hasData = d => {
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
    .attr("stroke-linejoin", "round");
  // .style("cursor", (d) => (hasData(d) ? "pointer" : "default"));

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

  // Hover: highlight country border and populate info panel with category breakdown
  // Mouseleave: restore default border color and reset info panel to placeholder text
  countryEls
    .on("mousemove", function (_event, d) {
      if (!hasData(d)) return;
      const region = countryToRegion[+d.id];
      const breakdown = regionCategoryBreakdown[region] || {};
      d3.select(this).attr("stroke", "#977DFF").attr("stroke-width", 1.8);
      const sortedCats = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
      const rows = sortedCats.map(([cat, n]) =>
        `<span style="display:inline-flex;align-items:center;gap:5px;">` +
        `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${categoryColors[cat]};flex-shrink:0;"></span>` +
        `<span style="color:#b6c1f1;">${cat}:</span> <strong style="color:#f3f8fc;">${n}</strong>` +
        `</span>`
      ).join("<br/>");
      infoPanel.html(
        `<strong style="color:#f3f8fc;font-size:14px;">${region}</strong>` +
        `<div style="margin-top:4px;font-size:12px;line-height:1.9;">${rows}</div>`
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

  // Build each region's pill badge (rect + text) — x/y position is set per-frame in render()
  labelEls.each(function(d) {
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
  const defaultInfo = `<span style="color:#b6c1f1;font-size:12px;">Hover a highlighted country to see its AI category breakdown</span>`;

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

  // Category legend
  const catLegendWrap = container.append("div")
    .style("display", "flex")
    .style("flex-wrap", "wrap")
    .style("align-items", "flex-start")
    .style("gap", "8px 24px")
    .style("padding", "12px 16px")
    .style("background", "#060d29")
    .style("border-radius", "10px")
    .style("width", `${width}px`)
    .style("box-sizing", "border-box");

  catLegendWrap.append("div")
    .style("font-size", "10px")
    .style("font-weight", "700")
    .style("color", "#3054f1")
    .style("letter-spacing", "0.06em")
    .style("text-transform", "uppercase")
    .style("flex-basis", "100%")
    .text("AI Use Case Categories");

  const categoryDefs = [
    { name: "Customer Experience",         color: "#977DFF", desc: "Chatbots, personalization, advisors" },
    { name: "Productivity & Automation",   color: "#6B5CE7", desc: "Workflows, document processing" },
    { name: "Operations & Infrastructure", color: "#3A4FE8", desc: "Monitoring, code review, security" },
    { name: "Capital Markets & Research",  color: "#0033FF", desc: "Data queries, research synthesis" },
    { name: "Risk & Fraud",                color: "#0600AB", desc: "Transaction monitoring, anomaly detection" },
  ];

  categoryDefs.forEach(cat => {
    const item = catLegendWrap.append("div")
      .style("display", "flex")
      .style("align-items", "flex-start")
      .style("gap", "7px")
      .style("min-width", "180px");
    item.append("div")
      .style("width", "10px")
      .style("height", "10px")
      .style("border-radius", "50%")
      .style("background", cat.color)
      .style("flex-shrink", "0")
      .style("margin-top", "2px");
    const txt = item.append("div");
    txt.append("div")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("color", "#f3f8fc")
      .style("line-height", "1.3")
      .text(cat.name);
    txt.append("div")
      .style("font-size", "10px")
      .style("color", "#b6c1f1")
      .style("line-height", "1.4")
      .text(cat.desc);
  });

  // How to read annotation
  container.append("div")
    .style("margin-top", "4px")
    .style("width", `${width}px`)
    .style("background", "#eef0fc")
    .style("border", "1px solid #b6c1f1")
    .style("border-radius", "14px")
    .style("padding", "16px 20px")
    .style("box-sizing", "border-box")
    .html(`
      <div style="font-size:13px; font-weight:700; color:#3054f1; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:6px;">How to read this</div>
      <div style="font-size:13px; color:#324ab3; line-height:1.65;">
        Countries are <strong style="color:#060d29;">shaded by the number of documented AI use cases</strong> from banks headquartered in that region — darker purple means more cases. Only highlighted countries have data. Hover any highlighted country to see a breakdown by use case category. Use the search bar above to snap to a region, or drag and scroll to explore.
      </div>
    `);

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
  const drag = d3.drag()
    .on("start", () => { svg.style("cursor", "grabbing"); })
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

  // Animated snap-to
  function rotateTo(lon, lat) {
    const r0 = projection.rotate();
    const r1 = [-lon, Math.max(-90, Math.min(90, -lat))];
    const interp = d3.interpolate(r0, r1);
    const timer = d3.timer(elapsed => {
      const progress = Math.min(1, elapsed / 900);
      projection.rotate(interp(d3.easeCubicInOut(progress)));
      render();
      if (progress >= 1) timer.stop();
    });
  }

  searchInput.on("change", function() {
    const val = this.value.trim();
    const coords = searchTargets[val];
    if (coords) {
      rotateTo(coords[0], coords[1]);
      this.value = "";
    }
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
  const { useCasesLong, useCases, evidentAIRanks, financials, aiIndustries } = await fetchData();
  createVizIndustries(aiIndustries);
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
