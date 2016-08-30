import React, {PropTypes, Component} from 'react';
import { Link } from 'react-router';
import EventItem from './EventItem';
import DocumentMeta from 'react-document-meta';

export default class RussianLandingList extends Component {
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
    const posts = this.state.projects.filter(row => row.language == 'ru').filter(row => row.isFeatured == true).slice(0,this.props.length);
    const postsWithoutFirstOne = this.state.projects.filter(row => row.language == 'ru').filter(row => row.isFeatured == true).slice(0,this.props.length);
    postsWithoutFirstOne.shift();

    return (
      <section className='research-homepage'>
        <h1>Исследовательская платформа &laquo;Искусство и&nbsp;исследование&raquo; реализует междисциплинарные проекты на&nbsp;стыке современного искусства и&nbsp;гуманитарных наук.</h1>
        <h1>
          <span>Основные направления:</span>
          <ul>
            <li>
              <a href="#">Россия. RESEARCH</a>
            </li>
            <li>
              <a href="#">Топохрония. RESEARCH</a>
            </li>
            <li>
              <a href="#">Территория. RESEARCH</a>
            </li>
            <li>
              <a href="#">Метод. RESEARCH</a>
            </li>
          </ul>
        </h1>
        <ul className="research-posts-list-featured">
          <EventItem id={posts[0].id} image={posts[0].featuredImage} event={posts[0]} />
        </ul>
        <ul className="research-posts-list">
          {postsWithoutFirstOne.map((post, key) =>
            <EventItem key={key} row={key} id={post.id} image={post.coverImage} event={post} />
          )}
        </ul>
      </section>
    );
  }
}
