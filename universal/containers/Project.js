import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ProjectPage from '../components/ProjectPage';
import * as PulseActions from '../actions/PulseActions';

class Project extends Component {
  static propTypes = {
    editEvent: React.PropTypes.func.isRequired,
    deleteEvent: React.PropTypes.func.isRequired,
    events: React.PropTypes.array,
    isLoggedIn: React.PropTypes.bool,
    uploadImage: React.PropTypes.func.isRequired,
    addImagesToStore: React.PropTypes.func.isRequired
  }

  render() {
    let actions = {
      editEvent: this.props.editEvent,
      deleteEvent: this.props.deleteEvent
    };

    return (
      <ProjectPage events={this.props.events} slug={this.props.params} actions={actions} isLoggedIn={this.props.isLoggedIn} uploadImage={this.props.uploadImage} addImagesToStore={this.props.addImagesToStore} />
    );
  }
}

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export default connect(
  state => ({
    events: state.pulseApp.events,
    isLoggedIn: state.pulseApp.isLoggedIn
  }),
  dispatch => bindActionCreators(PulseActions, dispatch)
)(Project);
