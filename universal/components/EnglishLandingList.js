import React, {PropTypes, Component} from 'react';
import { Link } from 'react-router';
import EventItem from './EventItem';
import DocumentMeta from 'react-document-meta';

export default class EnglishLandingList extends Component {
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
    const posts = this.state.projects.filter(row => row.language == 'en').filter(row => row.isFeatured == true).slice(0,this.props.length);
    const postsWithoutFirstOne = this.state.projects.filter(row => row.language == 'en').filter(row => row.isFeatured == true).slice(0,this.props.length);
    postsWithoutFirstOne.shift();

    return (
      <section className='research-homepage'>
        <h1>Research platform "Art and Research" implementing interdisciplinary projects at the intersection of contemporary art and the humanities.</h1>
        <h1>
          <span>Main directions:</span>
          <ul>
            <li>
              <a href="http://localhost:3001/p/russia-research-a084ca93-3ef4-4528-80bc-b09895e4a99b">Russia. RESEARCH</a>
            </li>
            <li>
              <a href="#">Topochronia. RESEARCH</a>
            </li>
            <li>
              <a href="#">Territory. RESEARCH</a>
            </li>
            <li>
              <a href="#">Method. RESEARCH</a>
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
