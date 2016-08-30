import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import LoginPage from '../components/LoginPage';
import * as PulseActions from '../actions/PulseActions';

class Login extends Component {
  static propTypes = {
    submitLogin: React.PropTypes.func.isRequired,
    isLoggedIn: React.PropTypes.bool,
    login: React.PropTypes.string,
    password: React.PropTypes.string
  }

  render() {
    return (
      <LoginPage submitLogin={this.props.submitLogin} isLoggedIn={this.props.isLoggedIn} login={this.props.login} password={this.props.password} />
    );
  }
}

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export default connect(
  state => ({
    isLoggedIn: state.pulseApp.isLoggedIn,
    login: state.pulseApp.login,
    password: state.pulseApp.password
  }),
  dispatch => bindActionCreators(PulseActions, dispatch)
)(Login);
