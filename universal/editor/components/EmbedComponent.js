import React, { Component, PropTypes } from 'react';
import { Entity } from 'draft-js';
import TextareaAutosize from 'react-autosize-textarea';

class EmbedComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false
    };

    this._startEdit = () => {
      this.props.blockProps.onStartEdit(this.props.block.getKey());
      this.setState({ editing: true });
    };

    this._handleContentChange = e => {
      let value = e.target.value;
      this.setState({ content: value });
    };

    this._handleCaptionChange = e => {
      let value = e.target.value;
      this.setState({ caption: value });
    };

    this._start = () => {
      this.props.blockProps.onStartEdit(this.props.block.getKey());
    };

    this._save = () => {
      var entityKey = this.props.block.getEntityAt(0);
      Entity.mergeData(entityKey, {content: this.state.content, caption: this.state.caption});
      this.setState({ editing: false });
      this.props.blockProps.onFinishEdit(this.props.block.getKey());
    };

    this._cancel = () => {
      this.setState({ editing: false });
      this.props.blockProps.onFinishEdit(this.props.block.getKey());
    };
  }

  componentDidMount() {
    this.setState({ content: this._getContentValue(), caption: this._getCaptionValue() });
    setTimeout(() => {
      this.resizeEmbed();
    }, 300);
    window.addEventListener("resize", this.resizeEmbed);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeEmbed);
  }

  resizeEmbed() {
    const embeds = document.querySelectorAll(".embed");

    Array.from(embeds).slice().map((embed) => {
      const embedContent = embed.childNodes[0];
      const defaultHeight = embedContent.getAttribute("height");
      const defaultWidth = embedContent.getAttribute("width");
      let height;

      if (defaultWidth && defaultHeight && !defaultWidth.match(/\%/)) {
        const ratio = parseFloat(defaultWidth) / parseFloat(defaultHeight);
        height = embed.clientWidth / ratio;
        embedContent.style.height = height + "px";
      }
    })
  }

  _getContentValue() {
    return Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['content'];
  }

  _getCaptionValue() {
    return Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['caption'];
  }

  rawContentMarkup(content) {
    return { __html: content };
  }

  rawCaptionMarkup(caption) {
    return { __html: caption };
  }

  render() {
    const {block} = this.props;
    const content = Entity.get(this.props.block.getEntityAt(0)).data.content;
    const embedCaption = (<div dangerouslySetInnerHTML={this.rawCaptionMarkup(Entity.get(this.props.block.getEntityAt(0)).data.caption)} />);

    let captionElement;

    if (this.state.editing && content) {
      captionElement = (
        <div className="form">
          <TextareaAutosize
            placeholder="Add caption..."
            value={this.state.caption}
            ref="embedCaption"
            onChange={this._handleCaptionChange} />
          <div className="button-actions">
            <button
              type='submit'
              className='button button-save'
              onClick={this._save}>
              Save
            </button>
            <button
              type='submit'
              className='button'
              onClick={this._cancel}>
              Cancel
            </button>
          </div>
        </div>
      )
    } else if (content) {
      captionElement = (
        <div
          className="caption"
          onClick={this._startEdit}>
          { this.state.caption ? embedCaption : 'Type to add a caption' }
        </div>
      )
    }

    return (
      <div className="embed-component">
        { content
          ?
          <div className="embed" dangerouslySetInnerHTML={this.rawContentMarkup(this.state.content)} />
          :
          <div>
            <TextareaAutosize
              placeholder="Add embed code..."
              value={this.state.content}
              ref="embed"
              onClick={this._start}
              onChange={this._handleContentChange} />
            <div className="actions">
              <button
                type='submit'
                className='button button-save'
                onClick={this._save}>
                Add
              </button>
            </div>
          </div>
        }
        {captionElement}
      </div>
    )
  }
}

export default EmbedComponent;
