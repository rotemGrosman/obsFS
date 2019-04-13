import React, { Component } from 'react';
import Histogram from 'react-chart-histogram';

class RealTimes extends Component {

    constructor(props) {
        super(props);
        this.state = {
            routeId: props.routeId,
            expectedData: props.expectedData,
            stopSelected: props.stopSelected,
            realData: {},
            error: null,
            isLoaded: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.stopSelected !== nextProps.stopSelected) {
            this.setState({
                stopSelected: nextProps.stopSelected,
                isLoaded: false
            });
            this.fetchData();    
        }
    }
    
    // shouldComponentUpdate(nextProps) {
    //     return this.state.stopSelected !== nextProps.stopSelected;
    // }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        fetch(`http://localhost:5000/api/real/${this.state.routeId}/${this.state.stopSelected}`)
          .then(res => 
            res.json()
          )
          .then(
            (result) => {
              this.setState({
                isLoaded: true,
                realData: this.parseRealData(result),
                error: null,
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

    parseRealData(result) {
        const {expectedData, stopSelected} = this.state;
        const currentIndex = expectedData.stops.findIndex(stop => stop === stopSelected);

        const initHistogram = {
            stopName: result.stopName,
            labels: [],
            data: Array(expectedData.data.length).fill(0)
        }

        const hourSlots = expectedData.data.map((line, index) => {
            const [hour, min] = line.start.split(":"); 
            initHistogram.labels.push(`${line.start}-${line.end}`)
            return {
                hour: Number(hour),
                min: Number(min),
                value: line.times[currentIndex],
                index
            };
        }).reverse();

        return result.trips.reduce((histogram, trip) => {
            const tripStart = new Date(trip.tripStart);
            const hourSlot = hourSlots.find(
                hourSlot => hourSlot.hour <= tripStart.getHours() && hourSlot.min <= tripStart.getMinutes());
            
            if ((hourSlot.value - 1) * 60 > trip.tripTimeInSec || (hourSlot.value + 1) * 60 < trip.tripTimeInSec){
                histogram.data[hourSlot.index]++;                
            }  
            return histogram;
        }, initHistogram);
    }

    render() {
        const {error, isLoaded, realData} = this.state;
        const options = { fillColor: '#FFFFFF', strokeColor: '#DDDDDD' };

        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div>
                    <div>Stop name - {realData.stopName}</div>
                    <Histogram
                        xLabels={realData.labels}
                        yValues={realData.data}
                        width='800'
                        height='200'
                        options={options}
                    />
                </div>
            );
        }
      }
}

export default RealTimes;
