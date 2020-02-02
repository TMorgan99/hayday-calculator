import React from 'react'
import * as d3 from 'd3'
import './App.css'

// experiment with the world geojson dataset.
const D3 = () => {
  const [width, height] = [960, 480]
  
  const url = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'
  d3.json(url).then( data => { 
    console.log(data)
  })

  return (
    <svg width={width} height={height} />
  )
}

const App = () => 
    <div className="App">
      <header className="App-header">
          D3 Hayday in React
      </header>
      <section>
        <D3/>
      </section>
    </div>

export default App
