var API = require('./api'),
    _ = require('lodash');

var Post = function(attrs) {
  this.attributes = {
    id: attrs.id,
    title: attrs.title,
    body: attrs.body,
    deleted: false
  }
};

Post.prototype.update = function(updateObject) {
  this.attributes = _.extend(this.attributes, updateObject);
  return API.update(this.attributes);
};

Post.prototype.save = function() {
  return API.post(this.attributes);
};

Post.prototype.delete = function() {
  return API.delete(this.attributes);
}

module.exports = Post;
