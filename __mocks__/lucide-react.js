module.exports = new Proxy({}, {
  get: function(target, name) {
    if (name === '__esModule') return false;
    var React = require('react');
    var Icon = React.forwardRef(function(props, ref) {
      return React.createElement('svg', Object.assign({}, props, { ref: ref, 'data-icon': String(name) }));
    });
    Icon.displayName = String(name);
    return Icon;
  }
});
