import React, {useEffect} from 'react'
import * as d3 from 'd3'

const [width, height] = [4860, 1200] // in full screen window
const myLevel = 50 // start small. very, very small 
const url = './data/building.csv'

const imageFor = (name) => `/images/${name.replace( /\s/g, '_' )}.png`

const parseGraph = (data) => {
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
} 

const D3App = () => { 
  const svg = d3.select('svg')

  d3.csv(url).then( data => { 
    // console.log(data)
  const graph = parseGraph(data)
    // console.log('graph:', graph)
  graph.links = []
  graph.nodes = graph.buildings.concat(graph.products)
    
  const tickActions = () => {
      //update circle positions each tick of the simulation
    const radius = 100 
    const boundX = (x) => Math.max(radius, Math.min(width - radius, x))
    const boundY = (y) => Math.max(radius, Math.min(height - radius, y))
    building
      .attr("transform", (d) => `translate(${d.x=boundX(d.x)} ${d.y=boundY(d.y)})` )
    product
      .attr("transform", (d) => `translate(${d.x=boundX(d.x)} ${d.y=boundY(d.y)})` )
      // link
      //     .attr("x1", (d) => d.source.x )
      //     .attr("y1", (d) => d.source.y )
      //     .attr("x2", (d) => d.target.x )
      //     .attr("y2", (d) => d.target.y )
  }  
  
  // ====================================================================
  // create somewhere to put the force directed graph
  const svg = d3.select("svg")
    .attr("viewBox", [0, 0, width, height])
  
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
  
          
  // draw lines for the links 

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

    })  //then()callback
  // ====================================================================
  
  return ( <svg width={width} height={height} /> )
}

export default D3App
