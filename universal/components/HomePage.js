import React, { PropTypes, Component } from 'react';
import { IndexLink, Link } from 'react-router';
import DocumentMeta from 'react-document-meta';

if (process.env.BROWSER) {
  require("../../style/HomePage.scss");
}

export default class HomePage extends Component {
  render() {
    const meta = {
      title: 'Владимир Никитович Наседкин и Татьяна Васильевна Баданина',
      description: 'Российский художник, живописец, график, автор объектов и инсталляций.',
      canonical: 'http://nasedkin-badanina.com/badanina/',
      meta: {
        charset: 'utf-8',
        name: {
          keywords: 'Наседкин,Владимир,Баданина,Татьяна'
        },
        property: {
          "og:title": 'Владимир Никитович Наседкин и Татьяна Васильевна Баданина',
          "og:url": 'http://nasedkin-badanina.com/badanina/',
          "og:description": 'Российский художник, живописец, график, автор объектов и инсталляций.',
          "og:image": 'https://upload.wikimedia.org/wikipedia/commons/0/02/Nasedkin_Vladimir_artist.jpg',
          "og:image:width": '800',
          "og:image:height": '1200',
          "twitter:title": 'Владимир Никитович Наседкин и Татьяна Васильевна Баданина',
          "twitter:description": 'Российский художник, живописец, график, автор объектов и инсталляций.',
          "twitter:image": 'https://upload.wikimedia.org/wikipedia/commons/0/02/Nasedkin_Vladimir_artist.jpg',
          "twitter:image:width": '800',
          "twitter:image:height": '1200',
          "twitter:card": "summary_large_image"
        }
      }
    };

    return (
      <div>
        <DocumentMeta {...meta} />
        <div className='portfolio-homepage'>
          <div className='portfolio-links'>
            <h1><Link to='/nasedkin' activeClassName='active'>Владимир Наседкин</Link></h1>
            <h1><Link to='/badanina' activeClassName='active'>Татьяна Баданина</Link></h1>
          </div>
        </div>
      </div>
    );
  }
}
