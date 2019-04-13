import React, { Component } from 'react';
import ExpectedTimes from './ExpectedTimes';
import RealTimes from './RealTimes';

class RouteData extends Component {

  constructor(props) {
    super(props);
    this.state = {
      stopSelected: undefined,
      error: null,
      isLoaded: false,
      routeId: props.routeId,
      expectedData: {}
    };
  }

  stopClicked(stopHeader) {
    const stop = stopHeader.split("-")[0];
    this.setState({ stopSelected : stop} );
  }

  componentWillReceiveProps(nextProps) {
    this.setState({routeId: nextProps.routeId});
  }

  shouldComponentUpdate(nextProps) {
      return this.state.routeId !== nextProps.routeId ||
             this.state.isLoaded !== nextProps.isLoaded ||
             this.state.error !== nextProps.error ||
             this.state.stopSelected !== nextProps.stopSelected
      ;
  }

  componentDidMount() {
    fetch("http://localhost:5000/api/expected/" + this.state.routeId)
    //fetch("/api/expected/4")
      .then(res => 
        res.json()
      )
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            expectedData: this.parseResult(result)
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  parseResult(expectedData) {
    expectedData.stopsText = [];
    for (let i=0; i < expectedData.stops.length - 1; i++) {
      expectedData.stopsText.push(`${expectedData.stops[i]}-${expectedData.stops[i+1]}`);
    }
    return expectedData;
  }

  render() {
    const { stopSelected, routeId, error, isLoaded, expectedData } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div className="RouteData">
          <header className="RouteData-header">Expected Times for Line {routeId}</header>
          <ExpectedTimes className="ExpectedTimes" expectedData={expectedData} stopClicked={this.stopClicked.bind(this)}>
          </ExpectedTimes>
          {stopSelected && <div>
            <header className="RouteData-header">Expected Times for Stop id #{stopSelected}</header>
            <RealTimes routeId={routeId} stopSelected={stopSelected} expectedData={expectedData}></RealTimes>
          </div>}
        </div>
      );
    }
  }
}

export default RouteData;
