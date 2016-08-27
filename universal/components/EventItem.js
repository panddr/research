import React, {PropTypes, Component} from 'react';
import moment from 'moment';
import EventInput from './EventInput';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as PulseActions from '../actions/PulseActions';

export default class EventItem extends Component {
  static propTypes = {
    id: PropTypes.any.isRequired,
    event: PropTypes.object.isRequired
  };

  constructor(props, context){
    super(props, context);
  }

  rawMarkupTitle() {
    let { event } = this.props;
    const rawMarkup = event.title;
    return { __html: rawMarkup };
  }

  render() {
    const { id, event } = this.props;

    const link = '/project/' + event.slug;
    const date = moment(event.created).subtract(10, 'days').calendar();

    return (
      <li className={event.largeCover ? 'portfolio-project-item large' : 'portfolio-project-item'}>
        <article>
          <Link to={link}>
            <span className="date">{date}</span>
            <h2><span dangerouslySetInnerHTML={this.rawMarkupTitle()} /></h2>
          </Link>
        </article>
      </li>
    );
  }
}
