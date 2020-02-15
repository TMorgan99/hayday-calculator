import React from 'react'
import * as d3 from 'd3'

const [width, height] = [2400, 800] // in full screen window
const myLevel = 12 // start small. very, very small 
const url = './data/building.csv'
const imageFor = (name) => `/images/${name.replace( /\s/g, '_' )}.png`

// ======== re-write the data.
const parseGraph = (data) => {
  data = data.filter( d => d.level <= myLevel )
//     // this creates four sets of unique nodes and links
    let buildings = []  // to hold the production centers.
    let nodes = []      // both inputs and outputs.
    let inlinks = []
    let outlinks = []
//     // I build these into objects so that key collision will give me uniqueness
//     // add seq: 0 to manage the left-to-right aspect.
    data.forEach(d => {
      buildings[d.building] = {name: d.building, seq: 0}
      nodes[d.ingredient] = {name: d.ingredient, seq: 0}
      nodes[d.product] = {name: d.product, seq: 0, building: d.building}
      inlinks[d.ingredient+d.building] = {source: d.ingredient, target: d.building}
      outlinks[d.building+d.product] = {source: d.building, target: d.product}
    })
    // now I remove the keys, leaving unique values
    return ({
      buildings:  d3.values(buildings),
      products:      d3.values(nodes),
      inlinks:    d3.values(inlinks),
      outlinks:   d3.values(outlinks),
  })
} 

// ======== figure out the relative sequencing between the nodes.
const add_seq = (graph) => {
  let counter = 0
  let more = false  // while control
  do {
    more = false
    graph.links.forEach( (l,i)  => {
          if ( l.source.seq >= l.target.seq ) {
            // but if ...
            if ( (l.source.name === 'Olive Oil') && (l.target.name === 'Sauce Maker') ) {
              // olive oil comes from the saucemaker, and goes back into the saucemaker,
              // we don't count this special case.
              // I wish I could access the source .building attribute, to check it programatically!
            } else {
              l.target.seq = l.source.seq + 1
              more = true 
              counter+=1
            }
          }
          })
    } while (more === true)
  // console.log( 'loop:', more, counter+=1)
}


const D3App = () => { 
  const svg = d3.select('svg')

  d3.csv(url).then( data => { 
//     // console.log(data)
  const graph = parseGraph(data)
    console.log('graph:', myLevel, graph)

  graph.links = graph.inlinks.concat(graph.outlinks)
  graph.nodes = graph.buildings.concat(graph.products)
    
// 
  const tickActions = () => {
      //update circle positions each tick of the simulation
    const radius = 100 // of the bounding box
    const boundX = (x) => Math.max(radius, Math.min(width - radius, x))
    const boundY = (y) => Math.max(radius, Math.min(height - radius -25, y))  // allow bottom margin

    inlink
      .attr("x1", (d) => d.source.x )     .attr("y1", (d) => d.source.y )
      .attr("x2", (d) => d.target.x -60)  .attr("y2", (d) => d.target.y )
  outlink
      .attr("x1", (d) => d.source.x +60)  .attr("y1", (d) => d.source.y )
      .attr("x2", (d) => d.target.x )     .attr("y2", (d) => d.target.y )
  building
      .attr("transform", (d) => `translate(${d.x=boundX(d.x)} ${d.y=boundY(d.y)})` )
    product
      .attr("transform", (d) => `translate(${d.x=boundX(d.x)} ${d.y=boundY(d.y)})` )

  }  


  //   // ====================================================================
//   // create somewhere to put the force directed graph
const svg = d3.select("svg")
.attr("viewBox", [0, 0, width, height])
  svg.append('defs')
    .append('marker')
      .append('path')

//       {/* <defs>
//     <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
//         markerWidth="6" markerHeight="6" fill="gold"
//     orient="auto-start-reverse">
//       <path d="M 0 0 L 10 5 L 0 10 L 3 5 z" />
//     </marker>
// </defs> */}


//     // draw lines for the links 
    const inlink = svg.append("g")
          .attr("class", "links")
          .selectAll("g.links")
          .data(graph.inlinks)
          .enter()
          .append("line")

    const outlink = svg.append("g")
        .attr("class", "links")
        .selectAll("g.links")
        .data(graph.outlinks)
        .enter()
        .append("line")


    // =====
        
    const building = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g.nodes g.building")
        .data(graph.buildings)
        .enter()
        .append("g")
        .attr("class", 'building')
      building
        .append('rect')
      building  
        .append('text')
  //  /* cannot set x,y on text element in css */
        .attr('x', -0)  // with text-anchor
        .attr('y', 120)
          .text( d => d.name )
      building
        .append('image')
        .attr('href', (d) => imageFor(d.name))

    // =====
        
      const product = svg.append("g")
          .attr("class", "nodes")
          .selectAll("g.nodes g.product")
          .data(graph.products)
          .enter()
          .append("g")
          .attr("class", 'product')
        product
          .append('ellipse')
        product  
          .append('text')
          .attr('x', -0)
          .attr('y', 25)
            .text( d => d.name )
        product
          .append('image')
          .attr('href', (d) => imageFor(d.name))

//   //set up the simulation 
  const simulation = d3.forceSimulation()
      .nodes(graph.nodes)
      .force('postition', d3.forceX( d => d.seq * 120 ))
      .force("charge_force", d3.forceManyBody())
      .force("center_force", d3.forceCenter(width / 2, height / 2))
      .force("anti_colide", d3.forceCollide( 100, 7, 3))
      .force("links",d3.forceLink(graph.links)
              .distance(+5)
              .id( (d) => d.name ))
  .on("tick", tickActions )

// at this point, we have nodes and links in the simulation.
// now we can calculate the seq values!
// this fails for olive oil and mayo, both coming out of the same building
    add_seq(graph)

    // which node is the furthest out? (has the greatest seq?)
    // console.log( graph.buildings.map( b => `${b.seq}:${b.name}`) )



//       // console.log( )
//   const drag = (simulation) => {
//       const dragstarted = (d) => {
//           if (!d3.event.active) simulation.alphaTarget(0.3).restart()
//           d.fx = d.x
//           d.fy = d.y
//       }
//       const dragged = (d) => {
//           d.fx = d3.event.x
//           d.fy = d3.event.y
//       }
//       const dragended = (d) => {
//           if (!d3.event.active) simulation.alphaTarget(0)
//           d.fx = null
//           d.fy = null
//       }
//       return d3.drag()
//           .on("start", dragstarted)
//           .on("drag", dragged)
//           .on("end", dragended)
//     }  
//   // allow buildings to be dragged about
//       building.call(drag(simulation))

    })  //then() callback
  // ====================================================================
  
  return ( <svg width={width} height={height} /> )
}

export default D3App
