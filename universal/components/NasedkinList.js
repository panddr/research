import React, {PropTypes, Component} from 'react';
import { Link } from 'react-router';
import EventItem from './EventItem';
import DocumentMeta from 'react-document-meta';

export default class NasedkinList extends Component {
  static propTypes = {
    events: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    uploadImage: React.PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      projects: this.props.events || []
    };
  }

  render() {
    return (
      <section className='research-homepage'>
        <h1>Исследовательская платформа «Искусство и исследование» реализует междисциплинарные проекты на стыке современного искусства и гуманитарных наук.</h1>
        <h1>
          <span>Основные направления:</span>
          <ul>
            <li>
              <a href="#">РОССИЯ. RESEARCH</a>
            </li>
            <li>
              <a href="#">ТОПОХРОНИЯ. RESEARCH</a>
            </li>
            <li>
              <a href="#">ТЕРРИТОРИЯ. RESEARCH</a>
            </li>
            <li>
              <a href="#">МЕТОД. RESEARCH</a>
            </li>
          </ul>
        </h1>
        <ul className="research-posts-list">
          {this.state.projects.filter(row => row.isFeatured == true).slice(0,this.props.length).map((event, key) =>
            <EventItem key={key} row={key} id={event.id} event={event} />
          )}
        </ul>
      </section>
    );
  }
}
