import React, {PropTypes, Component} from 'react';
import EventItem from './EventItem';
import { Link } from 'react-router';
import DocumentMeta from 'react-document-meta';

export default class BadaninaList extends Component {
  static propTypes = {
    events: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    uploadImage: React.PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      projects: this.props.events.filter(row => row.artist == 'badanina').filter(row => row.isFeatured == true) || []
    };
  }

  filterByCategory(projects, categorySelected) {
    let results = new Array();
    this.props.events.filter(row => row.artist == 'badanina').map((project) => {
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
    const { events, userId, actions } = this.props;
    const badanina = events.filter(row => row.artist == 'badanina' ).filter(row => row.isFeatured == true);
    let editable = true;

    const meta = {
      title: 'Татьяна Васильевна Баданина',
      description: 'Российский художник, живописец, график, автор объектов и инсталляций.',
      canonical: 'http://nasedkin-badanina.com/badanina/',
      meta: {
        charset: 'utf-8',
        name: {
          keywords: 'Наседкин,Владимир,Баданина,Татьяна'
        },
        property: {
          "og:title": 'Татьяна Васильевна Баданина',
          "og:url": 'http://nasedkin-badanina.com/badanina/',
          "og:description": 'Российский художник, живописец, график, автор объектов и инсталляций.',
          "og:image": 'https://upload.wikimedia.org/wikipedia/commons/1/12/%D0%A2%D0%B0%D0%BD%D1%8F_%D0%91%D0%B0%D0%B4%D0%B0%D0%BD%D0%B8%D0%BD%D0%B0_%D0%92%D0%B0%D1%81%D0%B8%D0%BB%D1%8C%D0%B5%D0%B2%D0%BD%D0%B0.jpg',
          "og:image:width": '800',
          "og:image:height": '1200',
          "twitter:title": 'Татьяна Васильевна Баданина',
          "twitter:description": 'Российский художник, живописец, график, автор объектов и инсталляций.',
          "twitter:image": 'https://upload.wikimedia.org/wikipedia/commons/1/12/%D0%A2%D0%B0%D0%BD%D1%8F_%D0%91%D0%B0%D0%B4%D0%B0%D0%BD%D0%B8%D0%BD%D0%B0_%D0%92%D0%B0%D1%81%D0%B8%D0%BB%D1%8C%D0%B5%D0%B2%D0%BD%D0%B0.jpg',
          "twitter:image:width": '800',
          "twitter:image:height": '1200',
          "twitter:card": "summary_large_image"
        }
      }
    };

    return (
      <section className='portfolio-project-list'>
        <DocumentMeta {...meta} />
        <header className='portfolio-header'>
          <div className='portfolio-links'>
            <h1><Link to='/nasedkin' activeClassName='active'>Владимир Наседкин</Link></h1>
            <h1><Link to='/badanina' activeClassName='active' onClick={::this.filterByCategoryAll.bind(this, badanina)}>Татьяна Баданина</Link></h1>
          </div>
        </header>
        <div>
          <p className="bio">
            <span>Татьяна Васильевна Баданина&nbsp;&mdash; российский </span>
              <a target="_blank" href="https://ru.wikipedia.org/wiki/%D0%91%D0%B0%D0%B4%D0%B0%D0%BD%D0%B8%D0%BD%D0%B0,_%D0%A2%D0%B0%D1%82%D1%8C%D1%8F%D0%BD%D0%B0_%D0%92%D0%B0%D1%81%D0%B8%D0%BB%D1%8C%D0%B5%D0%B2%D0%BD%D0%B0">художник</a>
              <span>, </span>
              <Link to={'/badanina/painting'} activeClassName='active' onClick={::this.filterByCategory.bind(this, badanina, "painting")}>
                живописец
              </Link>
              <span>, </span>
              <Link to={'/badanina/graphics'} activeClassName='active' onClick={::this.filterByCategory.bind(this, badanina, "graphics")}>
                график
              </Link>
              <span>, автор </span>
              <Link to={'/badanina/object'} activeClassName='active' onClick={::this.filterByCategory.bind(this, badanina, "object")}>
                объектов
              </Link>
              <span> и&nbsp;</span>
              <Link to={'/badanina/installation'} activeClassName='active' onClick={::this.filterByCategory.bind(this, badanina, "installation")}>
                инсталляций
              </Link>
              <span>.</span>
          </p>
          <ul className="portfolio-list">
            {this.state.projects.slice(0,this.props.length).map((event, key) =>
              <EventItem key={key} row={key} id={event.id} event={event} editable={editable} uploadImage={this.props.uploadImage} {...actions} />
            )}
          </ul>
        </div>
      </section>
    );
  }
}
