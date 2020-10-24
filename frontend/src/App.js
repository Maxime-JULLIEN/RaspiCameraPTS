import React from 'react';

import './App.css';
import socketIOClient from "socket.io-client";
import { Card } from "react-bootstrap";


class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: '',
    }
  }



  componentDidMount = () => {
    const socket = socketIOClient("https://rcp.linkable.tech",
      {
        query: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNjE2MjM5MDIyfQ.vFHBtvqMVml7DdivV5Yr1L2xFup-O1BoVM8Wv3dFMjs'
        },
        "transports": ["websocket"]
      });
    socket.on("data", data => {
      this.setState({ data: data })
    });

  }

  render = () => {

    return (
      <>
        <div className="app">

        </div>
      </>
    )
  }
}



export default App;
