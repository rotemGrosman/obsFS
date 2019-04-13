import React, { Component } from 'react';
import RouteData from './RouteData';
import './App.css';

class App extends Component {

  constructor() {
    super();
    this.state = {
    };
  }

  render() {
    const hardCodedRouteId = 100;

    return (
      <div className="App">
        <RouteData className="RouteData" routeId={hardCodedRouteId}></RouteData>
      </div>
    );
  }
}

export default App;
