import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as PulseActions from '../actions/PulseActions';

class NoMatch extends Component {
  render() {
    return (
      <div><h1>404</h1></div>
    );
  }
}

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export default connect(
  state => ({
  }),
  dispatch => bindActionCreators(PulseActions, dispatch)
)(NoMatch);
