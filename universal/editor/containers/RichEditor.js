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
import Switcher from "../../components/Switcher";

import {stateToHTML} from './export-html/src/main';

import Immutable from 'immutable';
import {Map} from 'immutable';
import TextareaAutosize from 'react-autosize-textarea';

import request from 'superagent';

import {findLinkEntities, Link} from '../decorators/link';

const blockRenderMap = Immutable.Map({
  'paragraph': {
    element: 'p'
  },
  'float-text': {
    element: 'figure'
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
      description: this.props.description || '',
      coverImage: this.props.coverImage || '',
      featuredImage: this.props.featuredImage || '',
      language: this.props.language || '',
      isFeatured: this.props.isFeatured || false,
      id: this.props.id || '',
      loadingImages: false,
      liveCaptionEdits: Map(),
      advancedSettingsPopupIsOpened: false
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
    this.handleDescriptionInput = (e) => this._handleDescriptionInput(e);
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

  //Cover image

  handleImageCoverInput(e) {
    const fileList = e.target.files;
    const file = fileList[0];
    this.insertCoverImage(file);
  }

  handleImageCoverClick() {
    this.refs.coverInput.click();
    this.refs.coverInput.value = "";
  }

  insertCoverImage(file) {
    const req = request
      .post('/api/0/images')
    req.attach('file', file);

    req.end((err, res) => {
      if (err) {
        console.log(err);
      } else {
        const obj = JSON.parse(res.text);
        const key = obj[0].key;
        this.setState({ coverImage: 'https://s3-eu-west-1.amazonaws.com/projectsuploads/uploads/images/' + key });
      }
    });
  }

  //Featured image

  handleImageFeaturedClick() {
    this.refs.featuredInput.click();
    this.refs.featuredInput.value = "";
  }

  handleImageFeaturedInput(e) {
    const fileList = e.target.files;
    const file = fileList[0];
    this.insertFeaturedImage(file);
  }

  insertFeaturedImage(file) {
    const req = request
      .post('/api/0/images')
    req.attach('file', file);

    req.end((err, res) => {
      if (err) {
        console.log(err);
      } else {
        const obj = JSON.parse(res.text);
        const key = obj[0].key;
        this.setState({ featuredImage: 'https://s3-eu-west-1.amazonaws.com/projectsuploads/uploads/images/' + key });
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

  _handleDescriptionInput(e) {
    this.setState({ description: e.target.value });
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

  toggleAdvancedSettingsPopup(e) {
    e.preventDefault();
    this.setState({ advancedSettingsPopupIsOpened: !this.state.advancedSettingsPopupIsOpened });
  }

  handleFeaturedChange() {
    this.setState({ isFeatured: !this.state.isFeatured });
  }

  handleLanguageChange(e) {
    this.setState({ language: e });
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

    if (this.state.id && this.state.title) {
      request
        .post('/api/0/events' + '/' + this.state.id)
        .send({title: this.state.title, html: html, description: this.state.description, coverImage: this.state.coverImage , featuredImage: this.state.featuredImage, language: this.state.language, isFeatured: this.state.isFeatured, id: this.state.id, RawDraftContentState: RawDraftContentState})
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) {
          } else {
            const url = "/p/" + res.body.slug;
            location.assign(url);
          }
        });
    } else if (this.state.title) {
      request
        .post('/api/0/events')
        .send({title: this.state.title, html: html, description: this.state.description, coverImage: this.state.coverImage , featuredImage: this.state.featuredImage, language: this.state.language, isFeatured: this.state.isFeatured, RawDraftContentState: RawDraftContentState})
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) {
          } else {
            const url = "/p/" + res.body.slug;
            location.assign(url);
          }
        });
    } else {
      return;
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
        <div className="editor-actions">
          <a href="#" onClick={::this.toggleAdvancedSettingsPopup}>...</a>
          <button type='submit' className='button' onClick={::this.handleSubmit}>Save</button>
        </div>
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
        {this.state.advancedSettingsPopupIsOpened
          ?
          <div className="advanced-settings">
            <header>
              <span>Advanced settings</span>
              <a href="#" className='button' onClick={::this.toggleAdvancedSettingsPopup}>Close</a>
            </header>
            <div>
              <section>
                <label>
                  <input
                    type='checkbox'
                    checked={this.state.isFeatured}
                    value={this.state.isFeatured}
                    onChange={::this.handleFeaturedChange} />
                  Featured
                </label>
              </section>
              <section>
                <span>Language</span>
                <Switcher
                  options  = { optionsLanguage }
                  type     = 'radio'
                  value    = { this.state.language }
                  onChange = { this.handleLanguageChange.bind(this) } />
              </section>
              <section>
                <span>Post description</span>
                <TextareaAutosize
                  placeholder="Type post description"
                  value={this.state.description}
                  ref="description"
                  onChange={this.handleDescriptionInput} />
              </section>
              <section>
                <span>Cover image (~600 progressive jpg)</span>
                { this.state.coverImage ? <div className="cover-image"><img src={this.state.coverImage}/></div> : null }
                <button type='submit' className='button' onClick={::this.handleImageCoverClick}>Upload image</button>
                <input type="file" ref="coverInput" style={{display: 'none'}}
                  onChange={::this.handleImageCoverInput.bind(this)} />
              </section>
              { this.state.isFeatured ?
                <section>
                  <span>Featured image (~2000 progressive jpg ratio 2width/1height)</span>
                  { this.state.featuredImage ? <div className="featured-image"><img src={this.state.featuredImage}/></div> : null }
                  <button type='submit' className='button' onClick={::this.handleImageFeaturedClick}>Upload image</button>
                  <input type="file" ref="featuredInput" style={{display: 'none'}}
                    onChange={::this.handleImageFeaturedInput.bind(this)} />
                </section>
                : null
              }
            </div>
          </div>
          : null
        }
      </div>
    );
  }
}

export default RichEditor;

const optionsLanguage = [
  {
    value: "ru",
    labelText: "РУ"
  },
  {
    value: "en",
    labelText: "EN"
  }
]
