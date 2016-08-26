import React, { Component, PropTypes } from 'react';

import {
  Editor,
  EditorState,
  Entity,
  RichUtils,
  ContentState,
  CompositeDecorator,
  AtomicBlockUtils,
  convertFromRaw,
  convertToRaw,
  getDefaultKeyBinding,
  DefaultDraftBlockRenderMap
} from 'draft-js';

import { getSelection } from '../utils/selection';
import { blockRenderersOptions } from '../utils/blockRenderersOptions';
import AddButton from '../components/AddButton';
import InlineToolbar from '../components/InlineToolbar';
import ImageComponent from '../components/ImageComponent';
import ImagesArrayComponent from '../components/ImageArrayComponent';
import EmbedComponent from '../components/EmbedComponent';

import {stateToHTML} from './export-html/src/main';

import Immutable from 'immutable';
import {Map} from 'immutable';
import TextareaAutosize from 'react-autosize-textarea';

import request from 'superagent';

import {findLinkEntities, Link} from '../decorators/link';

const blockRenderMap = Immutable.Map({
  'float-text': {
    element: 'div'
  }
});

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);

class RichEditor extends Component {
  constructor(props) {
    super(props);

    const decorator = new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link,
      },
    ]);

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      title: this.props.title || '',
      id: this.props.id || '',
      loadingImages: false,
      liveCaptionEdits: Map()
    };

    this.onChange = (editorState) => { this.setState({ editorState }); }
    this.getValue = () => {
      if (this.props.RawDraftContentState) {
        return EditorState.createWithContent(convertFromRaw(this.props.RawDraftContentState), decorator);
      } else {
        return EditorState.createEmpty(decorator);
      }
    }
    this.focus = () => this.refs.editor.focus();
    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.keyBindingFn = (e) => this._keyBindingFn(e);
    this.handleFileInput = (e) => this._handleFileInput(e);
    this.handleMultipleFileInput = (e) => this._handleMultipleFileInput(e);
    this.handleTitleInput = (e) => this._handleTitleInput(e);
    this.handleUploadImage = () => this._handleUploadImage();
    this.handleUploadImageArray = () => this._handleUploadImageArray();
    this.handleAddEmbed = () => this._handleAddEmbed();
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.toggleLinkAdd = (urlValue, selection) => this._toggleLinkAdd(urlValue, selection);
    this.toggleLinkRemove = (urlValue) => this._toggleLinkRemove(urlValue);
    this.insertImage = (file) => this._insertImage(file);
    this.insertMultipleImages = (files) => this._insertMultipleImages(files);
    this.blockRenderer = (block) => {
      if (block.getType() === 'atomic' && Entity.get(block.getEntityAt(0)).data.type === 'IMAGE') {
        return {
          component: ImageComponent,
          editable: false,
          props: {
            onStartEdit: (blockKey) => {
              const {liveCaptionEdits} = this.state;
              this.setState({liveCaptionEdits: liveCaptionEdits.set(blockKey, true)});
            },
            onFinishEdit: (blockKey) => {
              const {liveCaptionEdits} = this.state;
              this.setState({liveCaptionEdits: liveCaptionEdits.remove(blockKey)});
            },
          },
        };
      } else if (block.getType() === 'atomic' && Entity.get(block.getEntityAt(0)).data.type === 'EMBED') {
        return {
          component: EmbedComponent,
          editable: false,
          props: {
            onStartEdit: (blockKey) => {
              const {liveCaptionEdits} = this.state;
              this.setState({liveCaptionEdits: liveCaptionEdits.set(blockKey, true)});
            },
            onFinishEdit: (blockKey) => {
              const {liveCaptionEdits} = this.state;
              this.setState({liveCaptionEdits: liveCaptionEdits.remove(blockKey)});
            },
          },
        };
      } else if (block.getType() === 'atomic' && Entity.get(block.getEntityAt(0)).data.type === 'IMAGES') {
        return {
          component: ImagesArrayComponent,
          editable: false,
          props: {
            onStartEdit: (blockKey) => {
              const {liveCaptionEdits} = this.state;
              this.setState({liveCaptionEdits: liveCaptionEdits.set(blockKey, true)});
            },
            onFinishEdit: (blockKey) => {
              const {liveCaptionEdits} = this.state;
              this.setState({liveCaptionEdits: liveCaptionEdits.remove(blockKey)});
            }
          },
        };
      }
      return null;
    }
    this.blockStyler = (block) => {
      const type = block.getType()
      if (type === 'unstyled') {
        return 'paragraph';
      } else if (type === 'float-text') {
        return 'float-text';
      }
      return null;
    }
  }

  componentDidMount() {
    this.setState({ editorState: this.getValue() });
  }

  _handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _keyBindingFn(e) {
    const { editorState } = this.state;
    if (e.keyCode === 13 && e.shiftKey) {
      const newState = RichUtils.insertSoftNewline(editorState);
      this.onChange(newState);
      return true;
    }
    return getDefaultKeyBinding(e);
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  _toggleLinkAdd(urlValue) {
    if (urlValue !== '') {
      const entityKey = Entity.create('LINK', 'MUTABLE', {url: urlValue, target: "_blank"});
      this.onChange(
        RichUtils.toggleLink(
          this.state.editorState,
          this.state.editorState.getSelection(),
          entityKey
        ), this.focus);
    } else {
      this.onChange(
        RichUtils.toggleLink(
          this.state.editorState,
          this.state.editorState.getSelection(),
          null
        ), this.focus);
    }
  }

  _insertImage(file) {
    const entityKey = Entity.create('atomic', 'IMMUTABLE', {src: URL.createObjectURL(file), type: 'IMAGE', align: 'center'});
		this.onChange(AtomicBlockUtils.insertAtomicBlock(
      this.state.editorState,
      entityKey,
      ' '
    ));

    const req = request
      .post('/api/0/images')
    req.attach('file', file);

    req.end((err, res) => {
      if (err) {
        console.log(err);
      } else {
        const obj = JSON.parse(res.text);
        const key = obj[0].key;
        Entity.mergeData(entityKey, {src: 'https://s3-eu-west-1.amazonaws.com/projectsuploads/uploads/images/' + key});
      }
    });
  }

  _insertMultipleImages(files) {
    this.setState({ loadingImages: true });
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
        console.log(filesArrayFromAws);
        const entityKey = Entity.create('atomic', 'IMMUTABLE', {files: filesArrayFromAws, type: 'IMAGES', grid: true});
        this.onChange(AtomicBlockUtils.insertAtomicBlock(
          this.state.editorState,
          entityKey,
          ' '
        ));
        this.setState({ loadingImages: false });
      }
    });
  }

  _handleFileInput(e) {
    const fileList = e.target.files;
    const file = fileList[0];
    this.insertImage(file);
  }

  _handleMultipleFileInput(e) {
    const fileList = e.target.files;
    this.insertMultipleImages(fileList);
  }

  _handleTitleInput(e) {
    this.setState({ title: e.target.value });
  }

  _handleUploadImage() {
    this.refs.fileInput.click();
    this.refs.fileInput.value = "";
  }

  _handleUploadImageArray() {
    this.refs.multipleFileInput.click();
    this.refs.multipleFileInput.value = "";
  }

  _handleAddEmbed() {
    const entityKey = Entity.create('atomic', 'IMMUTABLE', {content:'', type: 'EMBED'});
    this.onChange(AtomicBlockUtils.insertAtomicBlock(
      this.state.editorState,
      entityKey,
      ' '
    ));
  }

  handleSubmit() {
    let contentState = this.state.editorState.getCurrentContent();
    let html = stateToHTML(contentState, blockRenderersOptions);
    let RawDraftContentState = convertToRaw(contentState);

    //remove empty <p>
    // if (RawDraftContentState.blocks[0].type === "unstyled" && RawDraftContentState.blocks[0].text === "") {
    //   RawDraftContentState.blocks.shift();
    //   contentState = EditorState.createWithContent(convertFromRaw(RawDraftContentState)).getCurrentContent();
    //   html = stateToHTML(contentState, blockRenderersOptions);
    // }

    if (this.state.id) {
      request
        .post('/api/0/events' + '/' + this.state.id)
        .send({title: this.state.title, html: html, id: this.state.id, RawDraftContentState: RawDraftContentState})
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) {
          } else {
            const url = "/project/" + res.body.slug;
            location.assign(url);
          }
        });
    } else {
      request
        .post('/api/0/events')
        .send({title: this.state.title, html: html, RawDraftContentState: convertToRaw(contentState)})
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) {
          } else {
            const url = "/project/" + res.body.slug;
            location.assign(url);
          }
        });
    }
  }

  render() {
    let contentState = this.state.editorState.getCurrentContent();
    let html = stateToHTML(contentState, blockRenderersOptions);
    let RawDraftContentState = convertToRaw(contentState);
    console.log(RawDraftContentState);


    const { editorState, selectedBlock, selectionRange } = this.state;

    return (
      <div className="editor" id="richEditor">
        <h1>
          <TextareaAutosize
            placeholder="Title"
            className="editor-title"
            value={this.state.title}
            ref="title"
            onChange={this.handleTitleInput} />
        </h1>
        <button type='submit' className='button button-save' onClick={::this.handleSubmit}>Save</button>
        <Editor
          blockRendererFn={this.blockRenderer}
          blockStyleFn={this.blockStyler}
          editorState={editorState}
          handleKeyCommand={this.handleKeyCommand}
          keyBindingFn={this.keyBindingFn}
          onChange={this.onChange}
          placeholder="Write something..."
          readOnly={this.state.liveCaptionEdits.count()}
          blockRenderMap={extendedBlockRenderMap}
          spellCheck={true}
          ref="editor"
        />
        <AddButton
          editorState={editorState}
          onUploadImage={this.handleUploadImage}
          onUploadImageArray={this.handleUploadImageArray}
          editorTitleNode={this.refs.title}
          onAddEmbed={this.handleAddEmbed}
          focus={this.focus}
        />
        <InlineToolbar
          editorState={editorState}
          onToggleInlineStyle={this.toggleInlineStyle}
          onToggleLinkAdd={this.toggleLinkAdd}
          onToggleBlockType={this.toggleBlockType}
          editorNode={this.refs.editor}
          editorTitleNode={this.refs.title}
          editorEnabled={true}
          onStartEdit={() => {
            const {liveCaptionEdits} = this.state;
            this.setState({liveCaptionEdits: liveCaptionEdits.set('1', true)});
          }}
          onFinishEdit={() => {
            const {liveCaptionEdits} = this.state;
            this.setState({liveCaptionEdits: liveCaptionEdits.remove('1')});
          }}
          focus={this.focus}
        />
        <input type="file" ref="fileInput" style={{display: 'none'}}
          onChange={this.handleFileInput} />
        <input type="file" ref="multipleFileInput" style={{display: 'none'}} multiple
          onChange={this.handleMultipleFileInput} />
        {this.state.loadingImages ? <span className="async-spinner" /> : null}
      </div>
    );
  }
}

export default RichEditor;
