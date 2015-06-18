var API = require('./api'),
    Post = require('./Post'),
    _ = require('lodash');

var ViewController = function(model) {
  this.model = model;
  this.postCollection = [];
  this.deletedPosts = [];
  this.actions = [];
  this.undoButton = document.getElementById('blog-undo-button');

  var postTemplate = document.getElementById('blog-post-template');
  this.template = _.template(postTemplate.textContent.trim());
  this.initialize();
};

ViewController.prototype.initialize = function() {
  this.establishHandlers();
  this.fetchPosts();
  var elements = this.generatePostDOMElements(this.postCollection);
  this.renderPosts(elements);
};

ViewController.prototype.establishHandlers = function() {
  var that = this;
  document.getElementsByClassName('blog-body__form-section__form__submit')[0]
  .addEventListener('click', function(e) {
    e.preventDefault();
    var title = document.getElementsByClassName('blog-body__form-section__form__title')[0].value;
    var body = document.getElementsByClassName('blog-body__form-section__form__body')[0].value;
    that.handleSubmit({
      title: title,
      body: body
    });
  });

  document.getElementById('blog-undo-button')
  .addEventListener('click', function(e) {
    e.preventDefault();

    that.handleUndo();
  });
};

ViewController.prototype.establishPostHandlers = function(postDOMElement) {
  var that = this;
  postDOMElement.getElementsByClassName('blog-post__delete-section__button')[0]
  .addEventListener('click', function(e) {
    e.preventDefault();
    var postId = parseInt(this.dataset.postid);
    that.handleDelete({
      id: postId
    });
  }); 
}

ViewController.prototype.fetchPosts = function() {
  var response = API.get();
  if (response.status === 200) {
    this.postCollection = response.body.map(function(post) {
      return new Post(JSON.parse(post));
    }).reverse();
  }
};

ViewController.prototype.generatePostDOMElements = function(posts) {
  var that = this;
  return posts.map(function(post) {
    var html = that.template(post.attributes);
    var wrapperDiv = document.createElement('div');
    wrapperDiv.innerHTML = html;
    that.establishPostHandlers(wrapperDiv.firstChild);
    return wrapperDiv.firstChild;
  });
};

ViewController.prototype.renderPosts = function(postDOMElements) {
  var that = this;
  var bodyContent = document.getElementsByClassName('blog-body__content')[0];
  postDOMElements.forEach(function(element) {
    bodyContent.appendChild(element);
  });
};

ViewController.prototype.renderPost = function(postDOMElement) {
  var parent = document.getElementsByClassName('blog-body__content')[0];
  parent.insertBefore(postDOMElement, parent.firstChild);
};

ViewController.prototype.handleSubmit = function(data) {
  this.addPost(data);
};

ViewController.prototype.handleDelete = function(data) {
  this.deletePost(data);
};

ViewController.prototype.handleUndo = function() {
  this.undo();
};

ViewController.prototype.addAction = function(data) {
  this.actions.unshift(data);
  this.showUndo();
};

ViewController.prototype.showUndo = function() {
  this.undoButton.classList.remove('hide');
};

ViewController.prototype.hideUndo = function() {
  this.undoButton.classList.add('hide');
};

ViewController.prototype.undo = function() {
  var action = this.actions.shift();
  if(action){
    if(action.actionType == "add") {
      this.deletePost(action.data);
    }
    else if(action.actionType == "delete") {
      this.addPost(action.data);
    }
  }
  if(this.actions.length === 0){
    this.hideUndo();
  }
};

ViewController.prototype.addPost = function(data) {
  var postModel = new Post(data);
  var response = postModel.save();
  if (response.status === 200) {
    this.postCollection.push(postModel);

    this.addAction({
      actionType: 'add',
      data: postModel.attributes
    });
  }

  var elements = this.generatePostDOMElements([postModel]);
  this.renderPost(elements[0]);
};

ViewController.prototype.deletePost = function(data) {
  var postModel = _.find(this.postCollection, function(post){
    return post.attributes.id === data.id;
  });
  var response = postModel.delete();
  if(response.status === 200){
    _.remove(this.postCollection, function(post){
      return post === postModel;
    });

    var postDOMElement = document.getElementById('blog-post-' + data.id);
    postDOMElement.parentNode.removeChild(postDOMElement);

    this.addAction({
      actionType: 'delete',
      data: postModel.attributes
    });
  }
};

module.exports = ViewController;
