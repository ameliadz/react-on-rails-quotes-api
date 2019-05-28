import React, { Component } from 'react';
import axios from 'axios'
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      apiData: null,
      apiDataLoaded: false,
    };
  }

  componentDidMount = async () => {
    const quotes = await axios.get('http://localhost:4567/quotes');
    const apiData = quotes.data;
    this.setState({
      apiData: apiData,
      apiDataLoaded: true
    });
  }

  showQuotesOnPage() {
    return this.state.apiData.map((quote) => {
      return (
        <div className="quote" key={quote.id}>
          <p className="content">{quote.content}</p>
          <span className="author">{quote.author} </span>
          <span className="category">{quote.category}</span>
        </div>
      );
    });
  }

  render() {
    return (
      <div className="App">
        <div>
          {(this.state.apiDataLoaded) ? this.showQuotesOnPage() : <p>Loading...</p>}
        </div>
      </div>
    );
  }
}

export default App;
