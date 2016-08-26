import React, { PropTypes, Component } from 'react';

import EventInput from '../components/EventInput';
import * as PulseActions from '../actions/PulseActions';
import RichEditor from '../editor';

export default class LoginPage extends Component {
  static propTypes = {
    submitLogin: PropTypes.func.isRequired,
    uploadImage: PropTypes.func.isRequired,
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
      <RichEditor />
    );
  }
}
