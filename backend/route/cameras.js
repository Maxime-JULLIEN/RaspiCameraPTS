const express = require("express");
const router = express.Router()

const token_verify = require("./middleware/token_verify");

router.get("/", token_verify, (req, res) => {
    const con = req.app.locals.db

    var sql = "SELECT id, name, displayName, connected FROM cameras JOIN camera_user ON cameras.id = camera_user.camera_id WHERE camera_user.user_id=?";
    con.query(sql, [req.userId], function (err, result) {
        if (err) return res.status(500).send({ message: err.message });



        console.log(result);
        res.json({
            cameras: result
        })

    })


})

router.get("/:id", token_verify, (req, res) => {
    const con = req.app.locals.db

    var sql = "SELECT id, name, displayName, connected FROM cameras JOIN camera_user ON cameras.id = camera_user.camera_id WHERE camera_user.user_id=? and cameras.id=? LIMIT 1";
    con.query(sql, [req.userId, req.params.id], function (err, result) {
        if (err) return res.status(500).send({ message: err.message });

        console.log(result);
        res.json(
            result[0]
        )

    })


})

router.post("/", token_verify, (req, res) => {


    res.send("Added")
})

module.exports = router;