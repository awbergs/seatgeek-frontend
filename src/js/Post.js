var API = require('./api'),
    _ = require('lodash');

var Post = function(attrs) {
  this.attributes = {
    id: attrs.id,
    title: attrs.title,
    body: attrs.body
  }
};

Post.prototype.update = function(updateObject) {
  this.attributes = _.extend(this.attributes, updateObject);
};

Post.prototype.save = function() {
  return API.post(this.attributes);
};

Post.prototype.delete = function() {
  return API.delete(this);
}

module.exports = Post;
