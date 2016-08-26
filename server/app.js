import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-redux';
import { RouterContext, match } from 'react-router';

import * as eventService from './api/service/event';
import configureStore from '../universal/store';
import routes from '../universal/routes';
import DevTools from '../universal/containers/devTools';

import DocumentMeta from 'react-document-meta';

const isDev = (process.env.NODE_ENV !== 'production');

require('dotenv').config();

export function handleRender(req, res) {
  console.log(' [x] Request for', req.url);
  eventService.getEvents()
  .then(initialEvents => {
    let initialState = {pulseApp: { events: initialEvents, isLoggedIn: false, userId: 'baseUser', login: process.env.LOGIN, password: process.env.PASSWORD } };

    const store = configureStore(req, initialState);

    // Wire up routing based upon routes
    match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
      if (error)  {
        console.log('Error', error);
        res.status(400);
        res.send(error);
        return;
      }

      if (redirectLocation) {
        res.redirect(redirectLocation);
        return;
      }

      // Render the component to a string
      const html = ReactDOMServer.renderToString(
        <Provider store={store}>
          <div>
            <head>
              { head ? head.title : null }
            </head>
            <RouterContext {...renderProps} />
          </div>
        </Provider>
      );

      let head = DocumentMeta.renderAsHTML();

      // Send the rendered page back to the client with the initial state
      res.render('index', { isProd: (!isDev), html: html, head: head, initialState: JSON.stringify(store.getState()) });
    });
  });
}
