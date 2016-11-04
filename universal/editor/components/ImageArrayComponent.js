import React, { Component, PropTypes } from 'react';
import { Entity } from 'draft-js';
import TextareaAutosize from 'react-autosize-textarea';

import request from 'superagent';

class ImageArrayComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editingCaption: false,
      editingImages: false,
      loadingImages: false,
      grid: true,
      files: []
    };

    this._startEditCaption = () => {
      this.props.blockProps.onStartEdit(this.props.block.getKey());
      this.setState({ editingCaption: true });
    };

    this._save = () => {
      const entityKey = this.props.block.getEntityAt(0);
      Entity.mergeData(entityKey, {files: this.state.files, grid: this.state.grid});
      this.setState({ editingCaption: false });
      this.props.blockProps.onFinishEdit(this.props.block.getKey());
    };

    this._cancel = () => {
      this.setState({ editingCaption: false });
      this.props.blockProps.onFinishEdit(this.props.block.getKey());
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({ files: this.getValue(newProps) });
    this.setState({ grid: this.getGridValue(newProps) });
  }

  componentDidMount() {
    this.setState({ files: this.getValue(this.props) });
    this.setState({ grid: this.getGridValue(this.props) });
    this.placeholder = document.createElement("div");
    this.placeholder.className = "placeholder";
  }

  handleCaptionChange(key, e) {
    let value = e.target.value;
    let files = this.state.files;
    files[key].caption = value;
    this.setState({ files: files });
  };

  toggleImageEdit() {
    this.setState({ editingImages: !this.state.editingImages });

    if (this.state.editingImages) {
      this.props.blockProps.onFinishEdit(this.props.block.getKey());
      this._save();
    } else {
      this.props.blockProps.onStartEdit(this.props.block.getKey());
    }
  }

  handleClick() {
    this.refs.multipleFileInput.click();
    this.refs.multipleFileInput.value = "";
  }

  handleAddNewImages(e) {
    const fileList = e.target.files;
    this.insertMultipleImages(fileList);
  }

  insertMultipleImages(files) {
    this.setState({ loadingImages: true });
    const entityKey = this.props.block.getEntityAt(0);
    let filesArrayToUpload = [];

    for (let i=0; i<files.length; i++) {
      filesArrayToUpload.push(files[i]);
    }

    const req = request
      .post('/api/0/images')
    filesArrayToUpload.forEach((file)=> {
      req.attach('file', file);
    });

    req.end((err, res) => {
      if (err) {
        console.log(err);
      } else {
        let filesArrayFromAws = [];
        res.body.map((file) => {
          filesArrayFromAws.push({src: 'https://s3-eu-west-1.amazonaws.com/projectsuploads/uploads/images/' + file.key});
        })
        let images = this.state.files.concat(filesArrayFromAws);
        Entity.mergeData(entityKey, {files: images});
        this.setState({ files: images, loadingImages: false });
      }
    });
  }

  alignImage(align, key, e) {
    e.preventDefault();
    const entityKey = this.props.block.getEntityAt(0);
    let files = this.state.files;
    files[key].align = align;
    console.log(files)
    Entity.mergeData(entityKey, {files: files});
    this.props.blockProps.onStartEdit(this.props.block.getKey());
    this.setState({ files: files });
    this.props.blockProps.onFinishEdit(this.props.block.getKey());
  }

  getValue(props) {
    return Entity
      .get(props.block.getEntityAt(0))
      .getData()['files'];
  }

  getGridValue(props) {
    return Entity
      .get(props.block.getEntityAt(0))
      .getData()['grid'];
  }

  rawMarkup(content) {
    return { __html: content };
  }

  handleDragStart(e) {
    this.dragged = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';

    // Firefox requires calling dataTransfer.setData
    // for the drag to properly work
    e.dataTransfer.setData("text/html", e.currentTarget);
  }

  handleDragEnd(e) {
    this.dragged.style.display = "flex";
    if (document.querySelectorAll(".placeholder")[0]) {
      this.dragged.parentNode.removeChild(this.placeholder);
    }

    // Update state
    if (this.over) {
      const images = this.state.files;
      const from = Number(this.dragged.dataset.id);
      let to = Number(this.over.dataset.id);
      if (from < to) to--;
      if (this.nodePlacement == "after") to++;
      images.splice(to, 0, images.splice(from, 1)[0]);

      this.setState({ files: images });
    }
  }

  handleDragOver(e) {
    e.preventDefault();

    this.dragged.style.display = "none";
    if (e.target.className == "placeholder") return;
    if (e.target.nodeName !== "LI") return;
    this.over = e.target;

    const relY = e.clientY - this.over.offsetTop;
    const height = this.over.offsetHeight / 2;
    const parent = e.target.parentNode;
    if (relY > height) {
      this.nodePlacement = "after";
      parent.insertBefore(this.placeholder, e.target.nextElementSibling);
    } else if (relY < height) {
      this.nodePlacement = "before";
      parent.insertBefore(this.placeholder, e.target);
    }
  }

  handleImageDelete(key, e) {
    e.preventDefault();
    const images = this.state.files;
    images.splice(key, 1);
    this.setState({ files: images });
  }

  toggleImagesPreviewType() {
    const entityKey = this.props.block.getEntityAt(0);
    this.setState({ grid: !this.state.grid });
    Entity.mergeData(entityKey, {grid: !this.state.grid});
  }

  render() {
    const {block} = this.props;

    if (this.state.editingImages) {
      return (
        <div className="images-array">
          {this.state.loadingImages ? <span className="async-spinner" /> : null}
          <div className="editor-image-actions">
            <input type="file" ref="multipleFileInput" style={{display: 'none'}} multiple
              onChange={::this.handleAddNewImages} />
            <span onClick={::this.handleClick}>Add new images</span>
            <span onClick={::this.toggleImageEdit}>Save</span>
          </div>
          <div className="editor-image-actions">
            <span
              className={ this.state.grid ? 'active' : null}
              onClick={::this.toggleImagesPreviewType}>
              Grid
            </span>
            <span
              className={ !this.state.grid ? 'active' : null}
              onClick={::this.toggleImagesPreviewType}>
              Gallery
            </span>
          </div>
          <div className="images-editing" onDragOver = { this.handleDragOver.bind(this) }>
            {this.state.files.map((file, key) => {
              const imgSrc = file.src;
              const imgCaption = (<div dangerouslySetInnerHTML={this.rawMarkup(file.caption)} />);
              const imgAlign = file.align || '';
              let captionElement;

              let alignOptions;

              if (this.state.grid) {
                alignOptions = (
                  <div className="align-options">
                    <a href="#" className={imgAlign == 'col-1' ? 'active' : null} onClick={::this.alignImage.bind(this, 'col-1', key)}>col-1</a>
                    <a href="#" className={imgAlign == 'col-2' ? 'active' : null} onClick={::this.alignImage.bind(this, 'col-2', key)}>col-2</a>
                  </div>
                )
              } else {
                alignOptions = (
                  <div className="align-options">
                    <a href="#" className={imgAlign == 'landscape' ? 'active' : null} onClick={::this.alignImage.bind(this, 'landscape', key)}>Landscape</a>
                    <a href="#" className={imgAlign == 'portrait' ? 'active' : null} onClick={::this.alignImage.bind(this, 'portrait', key)}>Portrait</a>
                  </div>
                )
              }

              return (
                <li
                  onDragStart = { this.handleDragStart.bind(this) }
                  onDragEnd = { this.handleDragEnd.bind(this) }
                  data-id = {key}
                  key = {key}>
                  <div className="image-editing">
                    <img src={imgSrc} />
                  </div>
                  <div className="image-editing-info">
                    <div className="form">
                      <TextareaAutosize
                        placeholder="Add caption..."
                        value={file.caption}
                        ref="imgCaption"
                        onChange={::this.handleCaptionChange.bind(this, key)} />
                      <button
                        type='submit'
                        className='button'
                        onClick={::this.handleImageDelete.bind(this, key)}>
                        X
                      </button>
                      {alignOptions}
                    </div>
                  </div>
              </li>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div className = {this.state.grid ? "editor-image-grid" : "editor-image-gallery"}>
        {this.state.loadingImages ? <span className="async-spinner" /> : null}
        <div className="editor-image-actions">
          <span onClick={::this.toggleImageEdit}>
            Edit&nbsp;
            {this.state.grid ? "grid" : "gallery"}
          </span>
        </div>
        <ul>
          {this.state.files.map((file, key) => {
            const imgSrc = file.src;
            const imgCaption = (<div dangerouslySetInnerHTML={this.rawMarkup(file.caption)} />);
            const imgAlign = file.align || '';
            let captionElement;

            let alignOptions;

            if (this.state.grid) {
              alignOptions = (
                <div className="align-options">
                  <a href="#" className={imgAlign == 'col-1' ? 'active' : null} onClick={::this.alignImage.bind(this, 'col-1', key)}>col-1</a>
                  <a href="#" className={imgAlign == 'col-2' ? 'active' : null}onClick={::this.alignImage.bind(this, 'col-2', key)}>col-2</a>
                </div>
              )
            } else {
              alignOptions = (
                <div className="align-options">
                  <a href="#" className={imgAlign == 'landscape' ? 'active' : null} onClick={::this.alignImage.bind(this, 'landscape', key)}>Landscape</a>
                  <a href="#" className={imgAlign == 'portrait' ? 'active' : null} onClick={::this.alignImage.bind(this, 'portrait', key)}>Portrait</a>
                </div>
              )
            }

            if (this.state.editingCaption) {
              captionElement = (
                <div className="form">
                  <TextareaAutosize
                    placeholder="Add caption..."
                    value={file.caption}
                    ref="imgCaption"
                    onChange={::this.handleCaptionChange.bind(this, key)} />
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
                  onClick={this._startEditCaption}>
                  { file.caption ? imgCaption : 'Type to add a caption' }
                </div>
              )
            }

            return (
              <li
                className = {"image " + imgAlign}
                key = {key}>
                <img src={imgSrc} />
                {alignOptions}
                {captionElement}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

export default ImageArrayComponent;
