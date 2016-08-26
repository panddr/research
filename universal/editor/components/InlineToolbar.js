import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import ToolbarIcon from '../components/ToolbarIcon';
import { getSelectionRect, getSelection, getCurrentBlock } from '../utils/selection';
import { Entity } from 'draft-js';

const INLINE_STYLES = [
  { icon: 'icon-bold', style: 'BOLD' },
  { icon: 'icon-italic', style: 'ITALIC' }
];

const BLOCK_TYPES = [
  { icon: 'icon-header-one', style: 'header-two' },
  { icon: 'icon-header-two', style: 'header-three' },
  // { icon: 'icon-ordered-list', style: 'ordered-list-item' },
  // { icon: 'icon-unordered-list', style: 'unordered-list-item' },
  { icon: 'icon-quote', style: 'blockquote' },
  { icon: 'icon-float', style: 'float-text' }
];

class InlineToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showURLInput: false,
      urlInputValue: ''
    };
    this.handleLinkInput = this.handleLinkInput.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const { editorState } = newProps;
    if (!newProps.editorEnabled) {
      return;
    }
    const selectionState = editorState.getSelection();
    if (selectionState.isCollapsed()) {
      if (this.state.showURLInput) {
        this.setState({
          showURLInput: false
        });
      }
      return;
    }
  }

  componentDidUpdate() {
    if (!this.props.editorEnabled || this.state.showURLInput) {
      return;
    }
    const selectionState = this.props.editorState.getSelection();
    if (selectionState.isCollapsed()) {
      return;
    }
    const nativeSelection = getSelection(window);
    if (!nativeSelection.rangeCount) {
      return;
    }
    const selectionBoundary = getSelectionRect(nativeSelection);

    const toolbarNode = ReactDOM.findDOMNode(this);
    const toolbarBoundary = toolbarNode.getBoundingClientRect();

    const parent = ReactDOM.findDOMNode(this.props.editorNode);
    const parentBoundary = parent.getBoundingClientRect();

    const title = ReactDOM.findDOMNode(this.props.editorTitleNode);
    const titleBoundary = title.getBoundingClientRect();
    /*
    * Main logic for setting the toolbar position.
    */
    toolbarNode.style.top = (selectionBoundary.top - parentBoundary.top + titleBoundary.height - toolbarBoundary.height + 65) + 'px';
    toolbarNode.style.width = toolbarBoundary.width + 'px';
    const widthDiff = selectionBoundary.width - toolbarBoundary.width;
    const left = (selectionBoundary.left - parentBoundary.left);
    toolbarNode.style.left = (left + widthDiff / 2) + 'px';
  }

  handleLinkInput(e, direct=false) {
    if (!direct) {
      e.preventDefault();
      e.stopPropagation();
    }
    const { editorState } = this.props;
    const selection = this.props.editorState.getSelection();
    if (selection.isCollapsed()) {
      this.props.focus();
      return;
    }
    const currentBlock = getCurrentBlock(editorState);
    let selectedEntity = '';
    let linkFound = false;
    currentBlock.findEntityRanges((character) => {
      const entityKey = character.getEntity();
      selectedEntity = entityKey;
      return entityKey !== null && Entity.get(entityKey).getType() === 'LINK';
    }, (start, end) => {
      let selStart = selection.getAnchorOffset();
      let selEnd = selection.getFocusOffset();
      if (selection.getIsBackward()) {
        selStart = selection.getFocusOffset();
        selEnd = selection.getAnchorOffset();
      }
      if (start == selStart && end == selEnd) {
        linkFound = true;
        const { url } = Entity.get(selectedEntity).getData();
        this.setState({
          showURLInput: true,
          urlInputValue: url
        }, () => {
          setTimeout(() => {
            this.refs.urlInputValue.focus();
            this.refs.urlInputValue.select();
          }, 0);
        });
      }
    });
    if (!linkFound) {
      this.setState({
        showURLInput: true
      }, () => {
        setTimeout(() => {
          this.refs.urlInputValue.focus();
        }, 0);
      });
    }
  }

  render() {
    const { showURLInput } = this.state;
    const { editorState, onToggleInlineStyle, onToggleLinkAdd, onToggleBlockType, onToggleLinkRemove, onStartEdit, onFinishEdit, editorEnabled } = this.props;
    const currentStyle = editorState.getCurrentInlineStyle();
    const urlInputValue = this.state.urlInputValue;

    const selection = editorState.getSelection();
    const blockType = editorState.getCurrentContent()
                                 .getBlockForKey(selection.getStartKey())
                                 .getType();

    let isOpen = true;
    if (!editorEnabled || editorState.getSelection().isCollapsed()) {
      isOpen = false;
    }

    if (showURLInput) {
      return (
        <div className={"toolbar url-input" + (isOpen ? ' is-open' : '') }>
          <input
            placeholder="Paste a link..."
            value={urlInputValue}
            ref="urlInputValue"
            onChange={(e) => {
              e.preventDefault();
              this.setState({ urlInputValue: e.target.value });
            }}
          />
          <button
            type='submit'
            className='button'
            onClick={(e) => {
              e.preventDefault();
              this.setState({ showURLInput: false });
              // onFinishEdit();
              onToggleLinkAdd(urlInputValue);
            }}>
            ✓
          </button>
        </div>
      );
    }

    return (
      <div className={"toolbar toolbar-icons" + (isOpen ? ' is-open' : '') }>
        {BLOCK_TYPES.map(type =>
          <ToolbarIcon
            key={type.label || type.icon}
            active={type.style === blockType}
            label={type.label}
            icon={type.icon}
            onToggle={onToggleBlockType}
            style={type.style}
          />
        )}
        {INLINE_STYLES.map(type =>
          <ToolbarIcon
            key={type.label || type.icon}
            active={currentStyle.has(type.style)}
            label={type.label}
            icon={type.icon}
            onToggle={onToggleInlineStyle}
            style={type.style}
          />
        )}
        <li
          className="toolbar-icon"
          key="icon-link"
          onClick={this.handleLinkInput}>
          <i className="icon-link"></i>
        </li>
      </div>
    )
  }
}

export default InlineToolbar;
