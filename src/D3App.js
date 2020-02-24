import React from 'react'
import * as d3 from 'd3'

const [width, height] = [8000, 960] // in full screen window
const myLevel = 180 // start small. very, very small 
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
      products:   d3.values(nodes),
      inlinks:    d3.values(inlinks),
      outlinks:   d3.values(outlinks),
  })
} 

// ======== figure out the relative sequencing between the nodes.
const add_seq = (graph) => {
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
          l.target.seq = l.source.seq +1
          more = true 
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
    const boundY = (y) => Math.max(radius, Math.min(height - radius -25, y))  // allow bottom margin

    // x is bound in each seq band.
    const columnWidth = 200 // of the seq numbers.
    const columnSpacing = 600
    const boundX = (x,seq) => Math.max(seq-columnWidth, Math.min(seq+columnWidth, x))

  building
    .attr("transform", d => `translate(${d.x=boundX(d.x,columnSpacing*d.seq)} ${d.y=boundY(d.y)})` )
  product
    .attr("transform", d => `translate(${d.x=boundX(d.x,columnSpacing*d.seq)} ${d.y=boundY(d.y)})` )
    // adjust the left and right endpoints to touch the ellipse and rect
    // ellipse.rx = 60, rect.width = 120
  inlink
    .attr("x1", d => d.source.x +60)    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x -60)    .attr("y2", d => d.target.y)
  outlink
    .attr("x1", d => d.source.x +60)    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x -60)    .attr("y2", d => d.target.y)

  }  


  //   // ====================================================================
//   // create somewhere to put the force directed graph
const svg = d3.select("svg")
.attr("viewBox", [0, 0, width, height])
  svg.append('defs')
    .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 20 20')
      .attr('refX', 10)
      .attr('refY', 10)
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('orient', 'auto')
      .attr('fill', 'gold')
      .append('path')
        .attr('d', 'M 0 0 L 20 10 L 0 20 L 6 10 z')

    // =====
    //     // draw lines for the links, first so they go under.
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
        .append('image')
        .attr('href', d => imageFor(d.name))
      building  
        .append('text')
  //  /* cannot set x,y on text element in css */
        .attr('x', -0)  // with text-anchor
        .attr('y', 90)
          .text( d => d.name )

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
          .append('image')
          .attr('href', d => imageFor(d.name))
        product  
          .append('text')
          .attr('x', -0)
          .attr('y', 25)
            .text( d => d.name )


//   //set up the simulation 
  const simulation = d3.forceSimulation()
      .nodes(graph.nodes)
      // .force("center_force", d3.forceCenter(width / 2, height / 2))
      .force("links",d3.forceLink(graph.links)
              .distance(+500)
              .id( d => d.name ))

// at this point, we have nodes and links in the simulation.
// now we can calculate the seq values!
    add_seq(graph)
    // console.log('nodes:', graph.nodes)

  simulation
  // the forceX does not apply for each tick??
    // .force('postition', d3.forceX( d => { console.log(d); return d.seq * 600 } ))
    .force("anti_colide", d3.forceCollide( 100, 7, 1))
    .force("charge_force", d3.forceManyBody())
    .on("tick", tickActions )

    // which node is the furthest out? (has the greatest seq?)
    console.log( graph.buildings.map( b => `${b.seq}:${b.name}`).sort() )
    // console.log( graph.products.map( p => p.name).sort().join(', ') )
// Products.CSV
// Wheat, Bread, Corn, Corn Bread, Egg, Cookie, Brown Sugar, Raspberry, Raspberry Muffin, Blackberry, Blackberry Muffin, Pizza, Tomato, Cheese, Spicy Pizza, Chili Pepper, Potato, Potato Bread, White Sugar, Butter, Frutti di Mare Pizza, Fish Fillet, Lobster Tail, Banana, Banana Bread, Grapes, Chicken Feed, Cow Feed, Soybean, Carrot, Pig Feed, Sheep Feed, Goat Feed, Wheat Bundle, Milk, Cream, Goat Milk, Goat Cheese, Sugarcane, Syrup, Popcorn, Buttered Popcorn, Chili Popcorn, Honey Popcorn, Honey, Chocolate Popcorn, Cacao, Pancake, Bacon and Eggs, Bacon, Hamburger, Fish Burger, Roasted Tomatoes, Baked Potato, Fish and Chips, Lobster Skewer, Onion, Grilled Onion, Eggplant, Grilled Eggplant, Salsa, Banana Pancakes, Fish Skewer, Mushroom, Sesame, Ginger, Carrot Pie, Pumpkin, Pumpkin Pie, Bacon Pie, Apple, Apple Pie, Fish Pie, Feta Pie, Casserole, Shepherds Pie, Lemon Curd, Lemon Pie, Peach, Peach Tart, Eggplant Parmesan, Tomato Sauce, Wool, Sweater, Cotton, Cotton Fabric, Blue Woolly Hat, Indigo, Blue Sweater, Red Scarf, Strawberry, Flower Shawl, Sunflower, Cotton Shirt, Wooly Chaps, Violet Dress, Pillow, Duck Feather, Blanket, Carrot Cake, Cream Cake, Red Berry Cake, Cherry, Cheesecake, Strawberry Cake, Chocolate Cake, Potato Feta Cake, Honey Apple Cake, Pineapple, Pineapple Cake, Lemon Cake, Fruit Cake, Orange, Silver Ore, Silver Bar, Gold Ore, Gold Bar, Platinum Ore, Platinum Bar, Coal, Refined Coal, Iron Ore, Iron Bar, Carrot Juice, Apple Juice, Cherry Juice, Tomato Juice, Berry Juice, Pineapple Juice, Orange Juice, Grape Juice, Watermelon, Watermelon Juice, Vanilla Ice Cream, Cherry Popsicle, Strawberry Ice Cream, Chocolate Ice Cream, Sesame Ice Cream, Orange Sorbet, Peach Ice Cream, Mint Ice Cream, Mint, Banana Split, Apple Jam, Raspberry Jam, Blackberry Jam, Cherry Jam, Strawberry Jam, Marmalade, Peach Jam, Grape Jam, Plum, Plum Jam, Bracelet, Necklace, Diamond Ring, Diamond, Iron Bracelet, Peony, Flower Pendant, Honeycomb, Beeswax, Coffee Bean, Espresso, Caffe Latte, Caffe Mocha, Raspberry Mocha, Hot Chocolate, Caramel Latte, Toffee, Iced Banana Latte, Lobster Soup, Tomato Soup, Pumpkin Soup, Fish Soup, Onion Soup, Rice Noodles, Noodle Soup, Potato Soup, Bell Pepper, Bell Pepper Soup, Olive Oil, Broccoli, Broccoli Soup, Mushroom Soup, Strawberry Candle, Raspberry Candle, Lemon Candle, Lemon, Floral Candle, Rustic Bouquet, Bright Bouquet, Candy Bouquet, Caramel Apple, Soft Bouquet, Chocolate, Lollipop, Jelly Beans, Sesame Brittle, Soy Sauce, Olive, Mayonnaise, Olive Dip, Rice, Sushi Roll, Lobster Sushi, Egg Sushi, Big Sushi Roll, Lettuce, Feta Salad, BLT Salad, Seafood Salad, Fresh Pasta, Pasta Salad, Veggie Platter, Summer Rolls, Fruit Salad, Summer Salad, Mushroom Salad, Veggie Bagel, Bacon Toast, Egg Sandwich, Honey Toast, Cucumber, Cucumber Sandwich, Onion Melt, Goat Cheese Toast, Berry Smoothie, Green Smoothie, Yogurt Smoothie, Cucumber Smoothie, Mixed Smoothie, Black Sesame Smoothie, Cocoa Smoothie, Plum Smoothie, Cloche Hat, Top Hat, Sun Hat, Flower Crown, Gnocchi, Veggie Lasagna, Lobster Pasta, Pasta Carbonara, Broccoli Pasta, Spicy Pasta, Mushroom Pasta, Hot Dog, Tofu Dog, Corn Dog, Onion Dog, Taco, Fish Taco, Quesadilla, Nachos, Tea Leaf, Green Tea, Milk Tea, Honey Tea, Lemon Tea, Apple Ginger Tea, Orange Tea, Iced Tea, Mint Tea
// Apple, Apple Ginger Tea, Apple Jam, Apple Juice, Apple Pie, BLT Salad, Bacon, Bacon Pie, Bacon Toast, Bacon and Eggs, Baked Potato, Banana, Banana Bread, Banana Pancakes, Banana Split, Beeswax, Bell Pepper, Bell Pepper Soup, Berry Juice, Berry Smoothie, Big Sushi Roll, Black Sesame Smoothie, Blackberry, Blackberry Jam, Blackberry Muffin, Blanket, Blue Sweater, Blue Woolly Hat, Bracelet, Bread, Bright Bouquet, Broccoli, Broccoli Pasta, Broccoli Soup, Brown Sugar, Butter, Buttered Popcorn, Cacao, Caffe Latte, Caffe Mocha, Candy Bouquet, Caramel Apple, Caramel Latte, Carrot, Carrot Cake, Carrot Juice, Carrot Pie, Casserole, Cheese, Cheesecake, Cherry, Cherry Jam, Cherry Juice, Cherry Popsicle, Chicken Feed, Chili Pepper, Chili Popcorn, Chocolate, Chocolate Cake, Chocolate Ice Cream, Chocolate Popcorn, Cloche Hat, Coal, Cocoa Smoothie, Coffee Bean, Cookie, Corn, Corn Bread, Corn Dog, Cotton, Cotton Fabric, Cotton Shirt, Cow Feed, Cream, Cream Cake, Cucumber, Cucumber Sandwich, Cucumber Smoothie, Diamond, Diamond Ring, Duck Feather, Egg, Egg Sandwich, Egg Sushi, Eggplant, Eggplant Parmesan, Espresso, Feta Pie, Feta Salad, Fish Burger, Fish Fillet, Fish Pie, Fish Skewer, Fish Soup, Fish Taco, Fish and Chips, Floral Candle, Flower Crown, Flower Pendant, Flower Shawl, Fresh Pasta, Fruit Cake, Fruit Salad, Frutti di Mare Pizza, Ginger, Gnocchi, Goat Cheese, Goat Cheese Toast, Goat Feed, Goat Milk, Gold Bar, Gold Ore, Grape Jam, Grape Juice, Grapes, Green Smoothie, Green Tea, Grilled Eggplant, Grilled Onion, Hamburger, Honey, Honey Apple Cake, Honey Popcorn, Honey Tea, Honey Toast, Honeycomb, Hot Chocolate, Hot Dog, Iced Banana Latte, Iced Tea, Indigo, Iron Bar, Iron Bracelet, Iron Ore, Jelly Beans, Lemon, Lemon Cake, Lemon Candle, Lemon Curd, Lemon Pie, Lemon Tea, Lettuce, Lobster Pasta, Lobster Skewer, Lobster Soup, Lobster Sushi, Lobster Tail, Lollipop, Marmalade, Mayonnaise, Milk, Milk Tea, Mint, Mint Ice Cream, Mint Tea, Mixed Smoothie, Mushroom, Mushroom Pasta, Mushroom Salad, Mushroom Soup, Nachos, Necklace, Noodle Soup, Olive, Olive Dip, Olive Oil, Onion, Onion Dog, Onion Melt, Onion Soup, Orange, Orange Juice, Orange Sorbet, Orange Tea, Pancake, Pasta Carbonara, Pasta Salad, Peach, Peach Ice Cream, Peach Jam, Peach Tart, Peony, Pig Feed, Pillow, Pineapple, Pineapple Cake, Pineapple Juice, Pizza, Platinum Bar, Platinum Ore, Plum, Plum Jam, Plum Smoothie, Popcorn, Potato, Potato Bread, Potato Feta Cake, Potato Soup, Pumpkin, Pumpkin Pie, Pumpkin Soup, Quesadilla, Raspberry, Raspberry Candle, Raspberry Jam, Raspberry Mocha, Raspberry Muffin, Red Berry Cake, Red Scarf, Refined Coal, Rice, Rice Noodles, Roasted Tomatoes, Rustic Bouquet, Salsa, Seafood Salad, Sesame, Sesame Brittle, Sesame Ice Cream, Sheep Feed, Shepherds Pie, Silver Bar, Silver Ore, Soft Bouquet, Soy Sauce, Soybean, Spicy Pasta, Spicy Pizza, Strawberry, Strawberry Cake, Strawberry Candle, Strawberry Ice Cream, Strawberry Jam, Sugarcane, Summer Rolls, Summer Salad, Sun Hat, Sunflower, Sushi Roll, Sweater, Syrup, Taco, Tea Leaf, Toffee, Tofu Dog, Tomato, Tomato Juice, Tomato Sauce, Tomato Soup, Top Hat, Vanilla Ice Cream, Veggie Bagel, Veggie Lasagna, Veggie Platter, Violet Dress, Watermelon, Watermelon Juice, Wheat, Wheat Bundle, White Sugar, Wool, Wooly Chaps, Yogurt Smoothie 

// TODO:git 
// I want a click on the building to highlight the links and products.

// console.log( )
  const drag = (simulation) => {
      const dragstarted = d => {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
      }
      const dragged = d => {
          d.fx = d3.event.x
          d.fy = d3.event.y
      }
      const dragended = d => {
          if (!d3.event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
      }
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
    }  
  // allow buildings to be dragged about
      building.call(drag(simulation))

    })  //then() callback
  // ====================================================================
  
  return ( <svg width={width} height={height} /> )
}

export default D3App
