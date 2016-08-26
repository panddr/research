import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import EventInput from './EventInput';
import EventItem from './EventItem';
import DocumentMeta from 'react-document-meta';
import RichEditor from '../editor';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as PulseActions from '../actions/PulseActions';

if (process.env.BROWSER) {
  require("../../style/Gallery.scss");
  require("../../style/Grid.scss");
  require("../../style/Post.scss");
  require("../../style/ImageZoom.scss");
}

class ProjectPage extends Component {
  static propTypes = {
    events: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    editEvent: PropTypes.func,
    deleteEvent: PropTypes.func,
    uploadImage: PropTypes.func,
    addImagesToStore: PropTypes.func,
    slug: PropTypes.object.isRequired,
    isLoggedIn: PropTypes.bool
  }

  constructor(props, context){
    super(props, context);
    this.state = {
      editing: false,
      deleting: false,
      loadMore: false
    };
  }

  componentDidMount() {
    const images = document.querySelectorAll(".image-zoom img");
    Array.from(images).slice().map((image) => {
      image.onclick = (e) => this.handleImageZoom(e);
    })

    const galleryInterval = setInterval(this.handleGallery, 1000);
    this.setState({ galleryInterval: galleryInterval });
    setTimeout(() => {this.handleGallery()}, 300);
    window.addEventListener("resize", this.handleGallery);

    setTimeout(() => {this.resizeEmbed()}, 300);
    window.addEventListener("resize", this.resizeEmbed);
  }

  handleGallery() {
    const wWidth = window.innerWidth;
    const galleries = document.querySelectorAll(".image-gallery");

    galleries.forEach((gallery) => {
      const ul = gallery.childNodes[0];
      const placeholder = document.createElement("div");
      placeholder.className = "image-count";
      const images = ul.childNodes;
      if (gallery.lastChild.className !== "image-count") {
        gallery.appendChild(placeholder);
        gallery.lastChild.innerHTML = 1 + " / " + images.length;
      }

      let imagesWidth = 0;

      images.forEach((image) => {
        imagesWidth = imagesWidth + image.offsetWidth;
      })

      // на маленьком разрешении, на первой картинке всегда включать правую, а на большом, если кликать на саму картинку, то вправо

      if (wWidth>600) {
        ul.style.width = imagesWidth + 60 + 'px';

        for (let i = 0; i < images.length; i++) {
          images[i].style.width = 'auto';
          images[i].onclick = (e) => {
            if (images[i].offsetLeft + 'px' == parseInt(ul.style.left, 10)) {
              ul.style.left = -images[i-1].offsetLeft + 'px';
              gallery.lastChild.innerHTML = i + " / " + images.length;
            } else {
              ul.style.left = -images[i].offsetLeft + 'px';
              gallery.lastChild.innerHTML = i+1 + " / " + images.length;
            }
          };
        }
      } else {
        ul.style.width = imagesWidth + 'px';

        for (let i = 0; i < images.length; i++) {
          images[i].style.width = wWidth + 'px';
          images[i].onclick = (e) => {
            if (e.clientX > wWidth/2) {
              ul.style.left = -images[i+1].offsetLeft + 'px';
              gallery.lastChild.innerHTML = i+2 + " / " + images.length;
            } else {
              ul.style.left = -images[i-1].offsetLeft + 'px';
              gallery.lastChild.innerHTML = i + " / " + images.length;
            }
          };
        }
      }

      gallery.style.height = ul.offsetHeight + 60 + 'px';
    });
  }

  resizeEmbed() {
    const embeds = document.querySelectorAll("figure.embed");

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

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeEmbed);
    window.removeEventListener("resize", this.handleGallery);
    clearInterval(this.state.galleryInterval);
  }

  rawMarkup() {
    let { slug } = this.props.slug;
    const project = this.props.events.filter(project => project.slug === slug );
    const rawMarkup = project[0].html;
    return { __html: rawMarkup };
  }

  rawMarkupTitle() {
    let { slug } = this.props.slug;
    const project = this.props.events.filter(project => project.slug === slug );
    const rawMarkup = project[0].title;
    return { __html: rawMarkup };
  }

  handleClick() {
    let { slug } = this.props.slug;
    const project = this.props.events.filter(project => project.slug === slug );

    if (this.props.isLoggedIn) {
      this.setState({ editing: true });

      this.props.addImagesToStore(project[0].images);
      window.scrollTo(0, 0);
    }
  }

  handleConfirm() {
    this.setState({ deleting: !this.state.deleting });
  }

  handleCancel() {
    this.setState({ editing: false });
    window.scrollTo(0, 0);
  }

  handleImageZoom(e) {
    const img = e.target;
    const body = document.getElementsByTagName("body")[0];

    if (img.parentNode.classList.contains("active")) {
      img.parentNode.classList.remove("active");
      body.classList.remove("hidden");

      img.setAttribute('style','transform:translate(0,0) scale(1); -webkit-transform:translate(0,0) scale(1); width:100%; height:auto;');
    } else {
      const wWidth = window.innerWidth;
      const wHeight = window.innerHeight;
      const wDimensions = wWidth/wHeight;

      const imgNaturalWidth = img.naturalWidth;
      const imgNaturalHeight = img.naturalHeight;

      const imgWidth = img.width;
      const imgHeight = img.height;
      const imgDimensions = imgWidth/imgHeight;

      img.parentNode.classList.add("active");
      body.classList.add("hidden");

      const x = wWidth/2 - img.offsetLeft - imgWidth/2;
      const y = wHeight/2 - img.offsetTop - imgHeight/2 + window.pageYOffset;
      let scale;

      if (wDimensions > imgDimensions) {
        if (imgNaturalHeight > wHeight) {
          scale = wHeight/imgHeight;
        } else {
          scale = imgNaturalHeight/imgHeight;
        }

        img.setAttribute('style','transform:translate(' + x + 'px,' + y + 'px) scale(' + scale + '); -webkit-transform:translate(' + x + 'px,' + y + 'px scale(' + scale + '); width:100%; height:auto;');
      } else {
        if (imgNaturalWidth > wWidth) {
          scale = wWidth/imgWidth;
        } else {
          scale = imgNaturalWidth/imgWidth;
        }

        img.setAttribute('style','transform:translate(' + x + 'px,' + y + 'px) scale(' + scale + '); -webkit-transform:translate(' + x + 'px,' + y + 'px scale(' + scale + '); width:100%; height:auto;');
      }
    }
  }

  handleSave(event) {
    if (event.title.length === 0) {
      this.props.deleteEvent(event);
    } else {
      this.props.editEvent(event);
    }
    this.setState({ editing: false });
  }

  handleLoadMore() {
    this.setState({ loadMore: true });
  }

  render() {
    let { slug } = this.props.slug;
    const projectArray = this.props.events.filter(project => project.slug === slug);

    const project = projectArray[0];
    const id = project.id;
    let element;
    let header;
    let confirmDeleting;

    if (this.state.deleting) {
      confirmDeleting = (
        <div className="confirm-deleting">
          Удалить проект?
          <button onClick={ () => this.props.deleteEvent(project) }>Да</button>
          <button onClick={ ::this.handleConfirm }>Нет</button>
        </div>
      );
    } else {
      confirmDeleting = (
        <button onClick={ ::this.handleConfirm }>X</button>
      );
    }

    if (this.state.editing) {
      element = (
        <div>
          <RichEditor title={project.title}
                      id={id}
                      html={project.html}
                      RawDraftContentState={project.RawDraftContentState}
                      editing={this.state.editing}
                      onSubmit={ (project) => this.handleSave(Object.assign({}, project, { id: id })) } />
        </div>
      );
    } else {
      let actions = (this.props.isLoggedIn) ?
        <div className="actions">
          <button className="button-edit" onClick={::this.handleClick}>✎</button>
          { confirmDeleting }
        </div> :
        null;
      element = (
        <div className="post-body">
          <Link className="research-logo" to='/'>Исследования и искусство</Link>
          <h1 className="title">{ project.title }</h1>
          {actions}
          <div dangerouslySetInnerHTML={this.rawMarkup()} />
        </div>
      );
    }

    return (
      <div>
        {element}
      </div>
    );
  }
}

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export default connect(
  state => ({
    images: state.pulseApp.images
  }),
  dispatch => bindActionCreators(PulseActions, dispatch)
)(ProjectPage);
