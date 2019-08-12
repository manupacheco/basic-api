const express = require('express');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const router = express.Router();

const User = require('../models/user');

router.get('/me', (req, res, next) => {
  req.session.currentUser
    ? res.status(200).json(req.session.currentUser)
    : next(createError(401, 'unauthorized'));
});

router.post('/signup', async (req, res, next) => {
  const { email, password } = req.body;
  (!email || !password) && next(createError(422, 'empty fields'));
  try {
    const userExists = await User.findOne({email})
    userExists && next(createError(422, 'email already exist'))
    const salt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT));
    const hashPass = bcrypt.hashSync(password, salt);
    const newUser = await User.create({ email, password: hashPass });
    req.session.currentUser = newUser;
    res.status(200).json(newUser);
  } catch(error) { next(error) };
});

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const userExists = await User.findOne({email});
      !userExists && next(createError(404, "user doesn't exist"));
      if (bcrypt.compareSync(password, userExists.password)) {
        req.session.currentUser = userExists;
        return res.status(200).json(userExists);
      } else { next(createError(401, 'unauthorized')); }
    } catch(error) { next(error); }
  },
);

router.post('/logout', (req, res) => {
  req.session.destroy();
  return res.status(204).send('logout');
});

module.exports = router;
