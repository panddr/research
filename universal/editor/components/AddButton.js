import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { getSelectedBlockNode } from '../utils/selection';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class AddButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      style: {},
      visible: false,
      isOpen: false,
    }

    this.node = null;
    this.blockKey = '';
    this.blockType = '';
    this.blockLength = -1;

    this.findNode = this.findNode.bind(this);
    this.setInitialStyle = this.setInitialStyle.bind(this);
    this.hideBlock = this.hideBlock.bind(this);
    this.openToolbar = this.openToolbar.bind(this);
    this.handleUploadImage = this.handleUploadImage.bind(this);
    this.handleUploadImageArray = this.handleUploadImageArray.bind(this);
    this.handleAddEmbed = this.handleAddEmbed.bind(this);
  }

  componentDidMount() {
    setTimeout(this.setInitialStyle, 0);
  }

  componentWillReceiveProps(newProps) {
    const { editorState } = newProps;
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    if (!selectionState.isCollapsed() || selectionState.anchorKey != selectionState.focusKey) {
      // console.log('no sel');
      this.hideBlock();
      return;
    }
    const block = contentState.getBlockForKey(selectionState.anchorKey);
    const bkey = block.getKey();
    if (block.getLength() > 0) {
      this.hideBlock();
      return;
    }
    if (block.getType() !== this.blockType) {
      this.blockType = block.getType();
      if (block.getLength() == 0) {
        setTimeout(this.findNode, 0);
      }
      return;
    }
    if (this.blockKey === bkey) {
      if (block.getLength() > 0) {
        this.hideBlock();
      } else {
        this.setState({
          visible: true
        });
      }
      return;
    }
    this.blockKey = bkey;
    if (block.getLength() > 0) {
      // console.log('no len');
      this.hideBlock();
      return;
    }
    setTimeout(this.findNode, 0);
  }

  setInitialStyle() {
    const title = ReactDOM.findDOMNode(this.props.editorTitleNode);
    const titleBoundary = title.getBoundingClientRect();
    this.setState({
      style: {
        top: titleBoundary.height + 65
      }
    });
  }

  hideBlock() {
    if (this.state.visible) {
      this.setState({
        visible: false,
        isOpen: false,
      });
    }
  }

  openToolbar(e) {
    this.setState({
      isOpen: !this.state.isOpen,
    }, this.props.focus);
  }

  findNode() {
    const node = getSelectedBlockNode(window);
    if (node === this.node) {
      return;
    }
    if (!node) {
      this.setState({
        visible: false,
        isOpen: false,
      });
      return;
    }
    const title = ReactDOM.findDOMNode(this.props.editorTitleNode);
    const titleBoundary = title.getBoundingClientRect();
    this.node = node;
    this.setState({
      visible: true,
      style: {
        top: node.offsetTop + titleBoundary.height + 65
      }
    });
  }

  handleUploadImage() {
    this.setState({
      visible: false,
      isOpen: false
    });
    this.props.onUploadImage();
  }

  handleUploadImageArray() {
    this.setState({
      visible: false,
      isOpen: false
    });
    this.props.onUploadImageArray();
  }

  handleAddEmbed() {
    this.setState({
      visible: false,
      isOpen: false
    });
    this.props.onAddEmbed();
  }

  render() {
    if (this.state.visible) {
      const { editorState, onUploadImage, onAddEmbed, onToggle } = this.props;
      return (
        <div style={this.state.style} className="add-button-toolbar">
          <button onClick={this.openToolbar} className={'button add-button' + (this.state.isOpen ? ' open-button' : '')}>+</button>
          {this.state.isOpen ? (
            <ReactCSSTransitionGroup
              transitionName="example"
              transitionEnterTimeout={200}
              transitionLeaveTimeout={100}
              transitionAppear={true}
              transitionAppearTimeout={100}
              className="buttons">
              <i className="icon-image"
                 onMouseDown={e => e.preventDefault()}
                 onClick={this.handleUploadImage}
              >
              </i>
              <i className="icon-image-array"
                 onMouseDown={e => e.preventDefault()}
                 onClick={this.handleUploadImageArray}
              >
              </i>
              <i className="icon-embed"
                 onMouseDown={e => e.preventDefault()}
                 onClick={this.handleAddEmbed}
              >
              </i>
            </ReactCSSTransitionGroup>
          ) : null}
        </div>
      )
    }
    return null;
  }
}

export default AddButton;
