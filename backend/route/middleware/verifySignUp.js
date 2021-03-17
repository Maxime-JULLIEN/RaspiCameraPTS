

checkDuplicateEmail = (req, res, next) => {
  const con = req.app.locals.db

  var sql = "SELECT email FROM users WHERE email=? LIMIT 1";
  con.query(sql, [req.body.email], function (err, result) {
    if (err) throw err;

    if (result.length) {
      res.status(400).send({
        message: "Failed! Email is already in use!"
      });
      return;
    }

    next();
  });

};

const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail
};

module.exports = verifySignUp;
