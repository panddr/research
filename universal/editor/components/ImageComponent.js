import React, { Component, PropTypes } from 'react';
import { Entity } from 'draft-js';
import TextareaAutosize from 'react-autosize-textarea';

class ImageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      align: 'center'
    };

    this._startEdit = () => {
      this.props.blockProps.onStartEdit(this.props.block.getKey());
      this.setState({ editing: true });
      // this.refs.imgCaption.focus();
    };

    this._handleCaptionChange = e => {
      let value = e.target.value;
      this.setState({ caption: value });
    };

    this._save = () => {
      var entityKey = this.props.block.getEntityAt(0);
      Entity.mergeData(entityKey, {caption: this.state.caption});
      this.setState({ editing: false });
      this.props.blockProps.onFinishEdit(this.props.block.getKey());
    };

    this._cancel = () => {
      this.setState({ editing: false });
      this.props.blockProps.onFinishEdit(this.props.block.getKey());
    };
  }

  componentDidMount() {
    this.setState({ caption: this._getValue() });
  }

  alignImage(align, e) {
    e.preventDefault();
    var entityKey = this.props.block.getEntityAt(0);
    Entity.mergeData(entityKey, {align: align});
    this.props.blockProps.onStartEdit(this.props.block.getKey());
    this.setState({ align: align });
    this.props.blockProps.onFinishEdit(this.props.block.getKey());
  }

  _getValue() {
    return Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['caption'];
  }

  rawMarkup(content) {
    return { __html: content };
  }

  render() {
    const {block} = this.props;
    const imgSrc = Entity.get(this.props.block.getEntityAt(0)).data.src;
    const imgCaption = (<div dangerouslySetInnerHTML={this.rawMarkup(Entity.get(this.props.block.getEntityAt(0)).data.caption)} />);
    const imgAlign = Entity.get(this.props.block.getEntityAt(0)).data.align || '';

    let captionElement;

    if (this.state.editing) {
      captionElement = (
        <div className="form">
          <TextareaAutosize
            placeholder="Add caption..."
            value={this.state.caption}
            ref="imgCaption"
            onChange={this._handleCaptionChange} />
          <div className="button-actions">
            <button
              type='submit'
              className='button'
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
    } else {
      captionElement = (
        <div
          className="caption"
          onClick={this._startEdit}>
          { this.state.caption ? imgCaption : 'Type to add a caption' }
        </div>
      )
    }

    return (
      <div className={"image " + imgAlign}>
        <img src={imgSrc} />
        <div className="align-options">
          <a href="#" className={imgAlign == 'center' ? 'active' : null} onClick={::this.alignImage.bind(this, 'center')}>center</a>
          <a href="#" className={imgAlign == 'full-width' ? 'active' : null} onClick={::this.alignImage.bind(this, 'full-width')}>full-width</a>
          <a href="#" className={imgAlign == 'float' ? 'active' : null} onClick={::this.alignImage.bind(this, 'float')}>float</a>
        </div>
        {captionElement}
      </div>
    )
  }
}

export default ImageComponent;
