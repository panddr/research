import React, { PropTypes, Component } from 'react';
import { IndexLink, Link } from 'react-router';

if (process.env.BROWSER) {
  require("../../style/Footer.scss");
}

export default class Footer extends Component {
  render() {
    return (
      <footer className='research-footer'>
        <IndexLink to='/' activeClassName='active' className="logo">Футер</IndexLink>
      </footer>
    );
  }
}
