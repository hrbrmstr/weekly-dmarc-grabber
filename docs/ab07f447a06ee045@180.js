// https://observablehq.com/@hrbrmstr/dmarc-processor-commonalities@180
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# DMARC Processor Commonalities`
)});
  main.variable(observer("chart")).define("chart", ["d3","grph","width","height"], function(d3,grph,width,height)
{
  const ticks = 150;
  const simulation = d3
    .forceSimulation(grph.nodes)
    .force(
      "link",
      d3.forceLink(grph.links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody())
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .stop()
    .tick(ticks);

  const svg = d3
    .create("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height]);

  var defs = svg.append("defs");

  var filter = defs
    .append("filter")
    .attr("id", "shadow")
    .attr("x", "-20%")
    .attr("y", "-20%")
    .attr("width", "140%")
    .attr("height", "140%");

  filter
    .append("feGaussianBlur")
    .attr("stdDeviation", "2 2")
    .attr("result", "shadow");

  var feMerge = filter.append("feOffset").attr("dx", "3").attr("dy", "3");

  const link = svg
    .append("g")
    .attr("stroke", "#b2b2b2")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(grph.links)
    .join("line");

  const node = svg
    .append("g")
    .attr("fill", "#fff")
    .attr("stroke", "#000")
    .attr("stroke-width", 0.5)
    .selectAll("circle")
    .data(grph.nodes)
    .join("circle")
    .attr("fill", (d) => d.color) //(d.children ? null : "#000"))
    .attr("stroke", (d) => (d.children ? null : "#fff"))
    .attr("r", (d) => (d.in_degree > 3.5 ? Math.sqrt(d.in_degree) : 3.5));

  node.append("title").text((d) => d.name);

  const shad = svg
    .append("g")
    .selectAll("text")
    .data(grph.nodes)
    .join("text")
    .text((d) => d.name)
    .attr("font-family", "inter black")
    .attr("font-size", (d) => (d.in_degree > 3 ? "16px" : "0px"))
    .attr("text-anchor", "middle")
    .style("fill", " white")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y - 6)
    .style("filter", "url(#shadow)");

  const txt = svg
    .append("g")
    .selectAll("text")
    .data(grph.nodes)
    .join("text")
    .text((d) => d.name)
    .attr("font-family", "inter black")
    .attr("font-size", (d) => (d.in_degree > 3 ? "16px" : "0px"))
    .attr("text-anchor", "middle")
    .style("fill", "black")
    .style("stroke", "white")
    .attr("stroke-width", 0.75)
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y - 6);

  link
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

  return svg.node();
}
);
  main.variable(observer("height")).define("height", function(){return(
900
)});
  main.variable(observer("grph")).define("grph", ["d3"], function(d3){return(
d3.json("https://hrbrmstr.github.io/weekly-dmarc-grabber/processors.json")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3")
)});
  main.variable(observer("fonts")).define("fonts", ["html"], function(html){return(
html`
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@xz/fonts@1/serve/inter.css">
<style>
html, body, h1, h2, h3, h4, b, p, span, ul, li { font-family: "Inter" }
h1 { max-width: 900px;}
</style>
`
)});
  return main;
}
