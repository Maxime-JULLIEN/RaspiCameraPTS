const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require("express");
const router = express.Router()
const verifySignUp = require("./middleware/verifySignUp");
const token_verify = require("./middleware/token_verify");

router.get("/me", token_verify, (req, res) => {
    const con = req.app.locals.db

    var sql = "SELECT * FROM users WHERE users.id=? LIMIT 1";
    con.query(sql, [req.userId], function (err, result) {
        if (err) return res.status(500).send({ message: err.message });

        if (!result.length) {
            return res.status(404).send({ message: "User Not found." });
        }

        const user = result[0]

        res.status(200).send({
            user: {
                id: user.id,
                email: user.email,
                name: user.username,
            }
        });
    })

});

router.post("/signup", [verifySignUp.checkDuplicateEmail], (req, res) => {
    const con = req.app.locals.db
    var sql = "INSERT INTO users SET ?";
    con.query(sql, [{
        email: req.body.email,
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 8)
    }

    ], function (err, result) {
        if (err) return res.status(500).send({ message: err.message });

        var token = jwt.sign({ id: result.insertId }, process.env.JWT_KEY, {
            expiresIn: 86400 // 24 hours
        });


        res.status(200).send({
            id: result.insertId,
            username: req.username,
            email: req.email,
            accessToken: token,
            expiration: Date.now() + 86400000,
            user: {
                id: result.insertId,
                email: req.email,
                name: req.username,
            }
        });
    });

});

router.post("/signin", (req, res) => {
    const con = req.app.locals.db

    var sql = "SELECT * FROM users WHERE email=? LIMIT 1";
    con.query(sql, [req.body.email], function (err, result) {
        if (err) return res.status(500).send({ message: err.message });

        if (!result.length) {
            return res.status(404).send({ message: "User Not found." });
        }

        const user = result[0]

        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        var token = jwt.sign({ id: user.id }, process.env.JWT_KEY, {
            expiresIn: 86400 // 24 hours
        });


        res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            accessToken: token,
            expiration: Date.now() + 86400000,
            user: {
                id: user.id,
                email: user.email,
                name: user.username,
            }
        });
    })

});

module.exports = router;

