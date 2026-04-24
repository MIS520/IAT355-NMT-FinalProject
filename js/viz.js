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

async function init() {
  const { useCases, evidentAIRanks, financials } = await fetchData();
  createVizRegions(useCases);
  createVizWorldMap(useCases);
  createVizRadar(evidentAIRanks, financials);
  createViz3(evidentAIRanks, financials);
  initCarousel();
}

init();
