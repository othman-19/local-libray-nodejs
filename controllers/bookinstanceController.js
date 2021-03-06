/* eslint-disable no-underscore-dangle */
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require('async');
const Book = require('../models/book');
const BookInstance = require('../models/bookinstance');

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {
  BookInstance.find()
    .populate('book')
    .exec((err, list_bookinstances) => {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render('bookinstance_list', {
        title: 'Book Instance List',
        bookinstance_list: list_bookinstances,
      });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, bookinstance) => {
      if (err) {
        return next(err);
      }
      if (bookinstance == null) {
        // No results.
        const error = new Error('Book copy not found');
        error.status = 404;
        return next(error);
      }
      // Successful, so render.
      res.render('bookinstance_detail', {
        title: `Copy: ${bookinstance.book.title}`,
        bookinstance,
      });
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {
  Book.find({}, 'title').exec((err, books) => {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    res.render('bookinstance_form', {
      title: 'Create BookInstance',
      book_list: books,
    });
  });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, 'title').exec((err, books) => {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render('bookinstance_form', {
          title: 'Create BookInstance',
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance,
        });
      });
    } else {
      // Data from form is valid.
      bookinstance.save((err) => {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }
  },
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res, next) {
  BookInstance.findById(req.params.id, (err, bookinstance) => {
    if (err) {
      return next(err);
    }
    if (bookinstance == null) {
      // No results.
      res.redirect('/catalog/bookinstances');
    } else {
      // Successful, so render.
      res.render('bookinstance_delete', {
        title: 'Delete Book Instance',
        bookinstance,
      });
    }
  })
    .populate('book')
    .exec();
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res, next) {
  BookInstance.findById(req.body.bookinstanceid, (err, bookinstance) => {
    if (err) {
      return next(err);
    }
    if (bookinstance == null) {
      // No results.
      res.redirect('/catalog/bookinstances');
    } else {
      // Successful, so render.
      BookInstance.findByIdAndRemove(req.body.bookinstanceid, (error) => {
        if (error) {
          return next(error);
        }
        // Success - go to author list
        res.redirect('/catalog/bookinstances');
      });
    }
  }).exec();
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res, next) {
  async.parallel(
    {
      // Get book instance to update for form.
      bookinstance(callback) {
        BookInstance.findById(req.params.id).populate('book').exec(callback);
      },
      // Get books list for form.
      books(callback) {
        Book.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.bookinstance == null) {
        // No results.
        const error = new Error('Book Instance not found');
        error.status = 404;
        res.redirect('/catalog/bookinstances');
        return next(err);
      }
      // Success.
      // Render book instance form and mark our selected book as checked.
      res.render('bookinstance_form', {
        title: 'Update BookInstance',
        bookinstance: results.bookinstance,
        bookinstance_due_date: results.bookinstance.due_back_for_update,
        book_list: results.books,
        selected_book: results.bookinstance.book._id,
      });
    },
  );
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // Validate fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, 'title').exec((err, books) => {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render('bookinstance_form', {
          title: 'Update BookInstance',
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance,
          bookinstance_due_date: bookinstance.due_back_for_update,
        });
      });
    } else {
      // Data from form is valid. Update the record.
      BookInstance.findByIdAndUpdate(
        req.params.id,
        bookinstance,
        {},
        (err, updatedInstance) => {
          if (err) {
            return next(err);
          }
          // Successful - redirect to book detail page.
          res.redirect(updatedInstance.url);
        },
      );
    }
  },
];
