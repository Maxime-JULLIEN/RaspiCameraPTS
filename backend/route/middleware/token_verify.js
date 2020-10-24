const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    next();
  } catch (err) {
    console.log("err : ", err);
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};