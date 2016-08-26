import React from 'react';
import {
  Entity,
} from 'draft-js';

export function findLinkEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
}

export const Link = (props) => {
  const {url} = Entity.get(props.entityKey).getData();
  return (
    <a href={url}>
      {props.children}
    </a>
  );
};
