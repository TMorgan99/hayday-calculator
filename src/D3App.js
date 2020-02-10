import React, {useEffect} from 'react'
import * as d3 from 'd3'


// 
const [width, height] = [4860, 1200] // in full screen window
  const myLevel = 50 // start small. very, very small 
  const url = './data/building.csv'

  const imageFor = (name) => `/images/${name.replace( /\s/g, '_' )}.png`

const parseGraph = ( data => {
  data = data.filter( d => d.level <= myLevel )
  // re-write the data.
    // this creates four sets of unique nodes and links
    let buildings = []  // to hold the production centers.
    let nodes = []      // both inputs and outputs.
    let inlinks = []
    let outlinks = []
    // I build these into objects so that key collision will give me uniqueness
        data.forEach(d => {
          buildings[d.building] = {name: d.building}
          nodes[d.ingredient] = {name: d.ingredient}
          nodes[d.product] = {name: d.product}
          inlinks[d.ingredient+d.building] = {source: d.ingredient, target: d.building }
          outlinks[d.building+d.product] = {source: d.building, target: d.product }
        })
    // now I remove the keys, leaving unique values
    return ({
      buildings:  d3.values(buildings),
      products:      d3.values(nodes),
      inlinks:    d3.values(inlinks),
      outlinks:   d3.values(outlinks),
  })
}) 

let graph = {}

const D3App = () => { 
  const svg = d3.select('svg')

  d3.csv(url).then( data => { 
    console.log(data)
  graph = parseGraph(data)
    console.log('graph:', graph)
  // graph.nodes = d3.merge(graph.buildings, graph.products)
  // graph.links = d3.merge(graph.inlinks, graph.outlinks)
    // graph.nodes = []
    graph.links = []
    graph.nodes = graph.buildings.concat(graph.products)

  console.log( 'graphII:', graph )  // these are the items to graph
  // ========================================================================
// const nodes_for_sim = graph.buildings.concat(graph.nodes)

// ====================================================================
// useEffect( () => {
    
  const tickActions = () => {
      //update circle positions each tick of the simulation
      const radius = 100 
      const boundX = (x) => Math.max(radius, Math.min(width - radius, x))
      const boundY = (y) => Math.max(radius, Math.min(height - radius, y))
      building
        .attr("transform", (d) => `translate(${d.x=boundX(d.x)} ${d.y=boundY(d.y)})` )
      product
        .attr("transform", (d) => `translate(${d.x=boundX(d.x)} ${d.y=boundY(d.y)})` )

          // node.attr("cx", function(d) { return ; })
   
      // link
      //     .attr("x1", (d) => d.source.x )
      //     .attr("y1", (d) => d.source.y )
      //     .attr("x2", (d) => d.target.x )
      //     .attr("y2", (d) => d.target.y )
  
  }  
  
  // ====================================================================
  //create somewhere to put the force directed graph
  const svg = d3.select("svg")
  .attr("viewBox", [0, 0, width, height])
  
  // console.log('graph.buildings:', graph.buildings)

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
      .attr('x', -50)
      .attr('y', 120)
        .text( d => d.name )
    building
      .append('image')
        .attr('href', (d) => imageFor(d.name))

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
        .attr('x', -50)
        .attr('y', 25)
          .text( d => d.name )
  product
        .append('image')
          .attr('href', (d) => imageFor(d.name))
  
          
  //draw lines for the links 
  // const link = svg.append("g")
  //     .attr("class", "links")
  //     .selectAll("g.links line")

  //     .data(graph.outlinks)
  //     .enter()
  //     .append("line")
      
  //     d3.forceCollide(30)
  
  //set up the simulation 
  const simulation = d3.forceSimulation()
      .nodes(graph.buildings.concat(graph.products))
      .force("charge_force", d3.forceManyBody())
      .force("center_force", d3.forceCenter(width / 2, height / 2))
      .force("anti_colide", d3.forceCollide( 100, 7, 3))
      // .force("links",d3.forceLink(graph.links)
      //         // .distance(+45)
      //         .id( (d) => d.name ))
      .on("tick", tickActions )
  
  const drag = (simulation) => {
      const dragstarted = (d) => {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
      }
          
      const dragged = (d) => {
          d.fx = d3.event.x
          d.fy = d3.event.y
      }
      
      const dragended = (d) => {
          if (!d3.event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
      }
          
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
    }  
  
  building.call(drag(simulation))
  // ====================================================================
      // },[graph])
  
    })  //then()callback
  

  
  return ( <svg width={width} height={height} /> )
}

export default D3App
// console.log(nodes_for_sim)

// const simulation = d3.forceSimulation()
//   .nodes(nodes_for_sim)
//   .force("charge_force", d3.forceManyBody())
//   .force("center_force", d3.forceCenter(width / 2, height / 2))

//   svg.append('text').attr('text','hello?')
//   console.log('svg:', svg)
//   //draw circles for the nodes 
// const node = svg.append("g")
// .attr("class", "nodes")
// .selectAll("circle")
// .data(nodes_for_sim)
// .enter()
// .append("circle")
// .attr("r", 5)
// .attr("fill", "red")

// console.log('node:', node)
//   // 
// //   const building = svg.append("g")
// //     .attr("class", "buildings")

// //     .selectAll("g.building")
// //     .data(buildings)
// //     .enter()
// //       .append('g')
// //         .attr('class', 'building')
// //     building
// //       .append("rect")
// //     building
// //       .append('text')
// //         .text( d => d.name )
// //     building  
// //       .append('image')
// //         .attr('href', d => imageFor(d.name) )
// // console.log(building)
