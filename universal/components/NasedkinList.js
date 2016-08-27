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

  filterByCategory(projects, categorySelected) {
    let results = new Array();
    this.props.events.filter(row => row.artist == 'nasedkin').map((project) => {
      if (project.categories) {
        project.categories.map((category) => {
          if (category.value == categorySelected && category.checked) {
            results.push(project);
          }
        });
      }
    });

    this.setState({ projects: results });
  }

  filterByCategoryAll(projects) {
    this.setState({ projects: projects });
  }

  render() {
    const { events, actions } = this.props;
    const nasedkin = events;

    return (
      <section className='portfolio-project-list'>
        <header className='portfolio-header'>
          <div className='portfolio-links'>
            <h1><Link to='/nasedkin' activeClassName='active' onClick={::this.filterByCategoryAll.bind(this, nasedkin)}>Искусство и исследования</Link></h1>
          </div>
        </header>
        <div>
          <ul className="portfolio-list">
            {this.state.projects.slice(0,this.props.length).map((event, key) =>
              <EventItem key={key} row={key} id={event.id} event={event} uploadImage={this.props.uploadImage} {...actions} />
            )}
          </ul>
        </div>
      </section>
    );
  }
}
