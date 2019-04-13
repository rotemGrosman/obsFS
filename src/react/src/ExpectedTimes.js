import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import './ExpectedTimes.css';

class ExpectedTimes extends Component {
    constructor(props) {
      super(props);
      this.state = {
        stopClicked: props.stopClicked,
        expectedData: props.expectedData,
      };
    }

    componentWillReceiveProps(nextProps) {
      this.setState({expectedData: nextProps.expectedData});
    }
  
    shouldComponentUpdate(nextProps) {
        return this.state.expectedData !== nextProps.expectedData;
    }

    render() {
      const {expectedData, stopClicked} = this.state;

      return (
        <Paper className="expectedTimesRoot">
          {<Table className="expectedTimesTable">
            <TableHead>
              <TableRow>
                <TableCell className="intervalHeader">Interval</TableCell>
                {expectedData.stopsText.map(stop =>
                  <TableCell key={stop} align="right" className="headerCell" onClick={stopClicked.bind(this, stop)}>{stop}</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {expectedData.data.map(row => (
                <TableRow key={row._id}>
                  <TableCell component="th" scope="row">
                    {row.start} - {row.end}
                  </TableCell>
                  {row.times.map((time, index) => (
                    <TableCell key={index} align="right">{time}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>}
        </Paper>
      );
    }
  }

  export default ExpectedTimes;