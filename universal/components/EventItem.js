import React, {PropTypes, Component} from 'react';
import moment from 'moment';
import EventInput from './EventInput';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as PulseActions from '../actions/PulseActions';

class EventItem extends Component {
  static propTypes = {
    id: PropTypes.any.isRequired,
    event: PropTypes.object.isRequired,
    editable: PropTypes.bool,
    editEvent: PropTypes.func,
    deleteEvent: PropTypes.func,
    uploadImage: PropTypes.func,
    addImagesToStore: PropTypes.func,
    images: React.PropTypes.array
  };

  constructor(props, context){
    super(props, context);
    this.state = {
      editing: false
    };
  }

  handleClick() {
    const { event } = this.props;

    if (this.props.editable) {
      this.setState({ editing: true });

      this.props.addImagesToStore(event.images);
    }
  }

  rawMarkupTitle() {
    let { event } = this.props;
    const rawMarkup = event.title;
    return { __html: rawMarkup };
  }

  handleSave(event) {
    if (event.title.length === 0) {
      this.props.deleteEvent(event);
    } else {
      this.props.editEvent(event);
    }
    this.setState({ editing: false });
  }

  render() {
    const { id, event, editEvent, deleteEvent } = this.props;

    const link = '/project/' + event.slug;

    return (
      <li className={event.largeCover ? 'portfolio-project-item large' : 'portfolio-project-item'}>
        <article>
          <Link to={link}>
            <h2><span dangerouslySetInnerHTML={this.rawMarkupTitle()} /></h2>
          </Link>
        </article>
      </li>
    );
  }
}


/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export default connect(
  state => ({
    images: state.pulseApp.images
  }),
  dispatch => bindActionCreators(PulseActions, dispatch)
)(EventItem);
