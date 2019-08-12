const createError = require('http-errors');

exports.isLogged = () => (req, res, next) => {
  req.session.currentUser 
  ? next()
  : next(createError(401, 'user not logged'));
};

exports.isNotLogged = () => (req, res, next) => {
  !req.session.currentUser
    ? next()
    : next(createError(403, 'user already logged'));
};
