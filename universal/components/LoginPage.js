import React, { PropTypes, Component } from 'react';

import EventInput from '../components/EventInput';
import * as PulseActions from '../actions/PulseActions';
import RichEditor from '../editor';

export default class LoginPage extends Component {
  static propTypes = {
    submitLogin: PropTypes.func.isRequired,
    isLoggedIn: PropTypes.bool,
    login: PropTypes.string,
    password: PropTypes.string
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      isLoggedIn: false,
      login: '',
      password: ''
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    const login = this.props.login;
    const password = this.props.password;
    if (this.state.login == login && this.state.password == password) {
      this.setState({ isLoggedIn: true });
      this.props.submitLogin(true);
    }
  }

  handleLogout(e) {
    e.preventDefault();
    this.setState({ isLoggedIn: false });
    this.props.submitLogin(false);
  }

  handleSave(event) {

  }

  handleLoginChange(e) {
    this.setState({ login: e.target.value });
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  render() {
    return (
      <div className="research-login">
        {!this.props.isLoggedIn ?
          <div className="overlay">
            <form className='form' method="post" action="/api/0/login">
              <fieldset>
                <input
                  type='text'
                  placeholder='Логин'
                  onChange={::this.handleLoginChange} />
                <input
                  type='password'
                  placeholder='******'
                  onChange={::this.handlePasswordChange} />
                <button
                  type='submit'
                  className='button'
                  onClick={::this.handleSubmit}>
                  Login
                </button>
              </fieldset>
            </form>
          </div>
          :
          <div>
            <RichEditor />
            <button
              type='submit'
              className='button button-logout'
              onClick={::this.handleLogout}>
              Logout
            </button>
          </div>
        }
      </div>
    );
  }
}
