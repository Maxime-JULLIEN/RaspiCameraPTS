const bcrypt = require('bcrypt');
const express = require("express");
const router = express.Router()
const parser = require("body-parser");

router.use(parser.urlencoded({ extended: true }))
router.use(parser.json())

router.post("/", (req, res) => {
    bcrypt.hash(req.body.password, 10).then(
      (hash) => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save().then(
          () => {
            res.status(201).json({
              message: 'User added successfully!'
            });
          }
        ).catch(
          (error) => {
            res.status(500).json({
              error: error
            });
          }
        );
      }
    );
  });

  module.exports = router;
