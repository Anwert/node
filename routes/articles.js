const express = require('express');
const router = express.Router();

const Article = require('../models/article');
const User = require('../models/user');

router.get('/add', ensureAuthenticated, (req, res) => {
  if (!req.user) {
    req.flash('danger', 'Please log in')
    res.redirect('/users/login');
  } else {
    res.render('add__article', {
      title: 'Add article',
    });
  }
});

router.post('/add', (req, res) => {

  req.check('title', 'Title is required').notEmpty();
  req.check('body', 'Article body is required').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    res.render('add__article', {
      title: 'Add Article',
      errors,
    });
  } else {
    const article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save((err) => {
      if (err) return console.log(err);
      req.flash('success', 'Article added');
      res.redirect('/');
    });
  }
});

router.get('/edit/:id', (req, res) => {
  if (!req.user) {
    req.flash('danger', 'Please log in')
    res.redirect('/users/login');
  } else {
    Article.findById(req.params.id, (err, article) => {
      if (article.author != req.user._id) {
        req.flash('danger', 'Not authorized');
        res.redirect('/');
      }
      if (err) return console.log(err);
      res.render('edit_article', {
        title: 'Edit article',
        article,
      });
    });
  }
});

router.post('/edit/:id', ensureAuthenticated, (req, res) => {
  const article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  const query = { _id: req.params.id }

  Article.update(query, article, (err) => {
    if (err) return console.log(err);
    req.flash('success', 'Article updated')
    res.redirect('/');
  });
});

router.delete('/:id', (req, res) => {
  if (!req.user._id) res.status(500).send();

  Article.findById(req.paprms.id, (err, article) => {
    if (err) throw err;
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      const query = { _id: req.params.id }

      Article.remove(query, (err) => {
        if (err) return console.log(err);
        res.send('Success');
      });
    }
  });
});

router.get('/:id', (req, res) => {
  if (!req.user) {
    req.flash('danger', 'Please log in')
    res.redirect('/users/login');
  } else {
    Article.findById(req.params.id, (err, article) => {
      if (err) return console.log(err);
      User.findById(article.author, (err, user) => {
        if (err) return console.log(err);
        res.render('article', {
          article,
          author: user.name,
        });
      });
    });
  }
});

function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) return next()
  req.flash('danger', 'Please log in');
  res.redirect('/users/login');
};

module.exports = router;
