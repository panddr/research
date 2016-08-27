import React from 'react';
import {
  Entity,
} from 'draft-js';

export const blockRenderersOptions = {
  blockRenderers: {
    atomic: (block) => {
      const type = Entity.get(block.getEntityAt(0)).data.type;
      if (type === 'IMAGE') {
        const imgContent = Entity.get(block.getEntityAt(0)).data.src;
        let imgCaption = '';
        let imgAlign = Entity.get(block.getEntityAt(0)).data.align;
        if (Entity.get(block.getEntityAt(0)).data.caption) {
          imgCaption = '<figcaption>' + Entity.get(block.getEntityAt(0)).data.caption + '</figcaption>';
        }
        return '<figure class="image image-zoom ' + imgAlign + '">' + '<img src=' + imgContent + '>' + imgCaption + '</figure>';
      } else if (type === 'EMBED') {
        const embed = Entity.get(block.getEntityAt(0)).data.content;
        let embedAlign = Entity.get(block.getEntityAt(0)).data.align;
        let embedCaption = '';
        if (Entity.get(block.getEntityAt(0)).data.caption) {
          embedCaption = '<figcaption>' + Entity.get(block.getEntityAt(0)).data.caption + '</figcaption>';
        }
        return '<figure class="embed ' + embedAlign + '">' + embed + embedCaption + '</figure>';
      } else if (type === 'IMAGES') {
        const files = Entity.get(block.getEntityAt(0)).data.files;
        const grid = Entity.get(block.getEntityAt(0)).data.grid;
        let images = '';

        if (grid) {
          files.map((file, key) => {
            const imgSrc = file.src;
            const imgAlign = file.align || '';
            let imgCaption = '';
            if (file.caption) {
              imgCaption = '<figcaption>' + file.caption + '</figcaption>';
            }
            const img = '<li class="image image-zoom ' + imgAlign + '"><img src=' + imgSrc + ' />' + imgCaption + '</li>'
            images = images.concat(img);
          })
          return '<figure class="image-grid"><ul>' + images + '</ul></figure>';
        } else {
          files.map((file, key) => {
            const imgSrc = file.src;
            const imgAlign = file.align || '';
            let imgCaption = '';
            if (file.caption) {
              imgCaption = '<figcaption>' + file.caption + '</figcaption>';
            }
            const img = '<li class="image ' + imgAlign + '"><img src=' + imgSrc + ' />' + imgCaption + '</li>'
            images = images.concat(img);
          })
          return '<figure class="image-gallery"><ul>' + images + '</ul></figure>';
        }
      }
    }
  },
};
