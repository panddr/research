import React, { PropTypes, Component } from 'react';
import { IndexLink, Link } from 'react-router';

if (process.env.BROWSER) {
  require("../../style/Header.scss");
}

export default class Header extends Component {
  render() {
    return (
      <header className='research-header'>
        <IndexLink to='/' activeClassName='active' className="logo">Искусство и исследования</IndexLink>
        <div className='wrapper'>
          <div className='language-links'>
            <IndexLink to='/' activeClassName='active'>РУ</IndexLink>
            <Link to='/en' activeClassName='active'>EN</Link>
          </div>
          <div className='social-links'>
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
          </div>
        </div>
      </header>
    );
  }
}
