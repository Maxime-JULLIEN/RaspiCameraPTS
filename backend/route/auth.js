const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require("express");
const router = express.Router()

router.get("/login", (req, res) => {
    const con = req.app.locals.db
    const email = req.body.email

    var sql = 'SELECT user_id, password FROM users WHERE email=? OR NNI=? LIMIT 1';
    con.query(sql, [email, email], function (err, result) {
        if (err) {
            res.status(500).json({
                error: err
            });
            throw err;
        }
        const user = result[0]
        console.log(user);

        if (!user) {
            return res.status(401).json({
                error: new Error('User not found!')
            });
        }
        bcrypt.compare(req.body.password, user.password).then(
            (valid) => {
                if (!valid) {
                    console.log(req.body.password);
                    console.log(user.password);
                    console.log("Pas valide");
                    return res.status(401).json({
                        error: 'Incorrect password!'
                    });
                }

                const token = jwt.sign(
                    { userId: user._id },
                    'RANDOM_TOKEN_SECRET',
                    // { expiresIn: '24h' }
                );

                res.cookie('token', token, {
                    secure: true, // set to true if your using https
                    httpOnly: true
                });

                res.status(200).json({
                    "access_token": token,
                    "token_type": "Bearer",
                    // "expires_in":86400
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
    )
})

router.get("/token", (req, res) => {
    const con = req.app.locals.db
    const grant_type = req.body.grant_type


    if (!grant_type || grant_type == "") {
        return res.status(401).json({
            error: "no client authentication included"
        });
    }
    else if (grant_type == "client_credentials") {
        console.log("Client credentials auth");
        const client_id = req.body.client_id
        const client_secret = req.body.client_secret

        if (!client_id || client_id == "") {
            res.status(403).json({
                error: "invalid_request",
                error_description: "Client_ID not found"
            });
        } else if (!client_secret || client_secret == "") {
            res.status(403).json({
                error: "invalid_request",
                error_description: "Client_Secret not found"
            });
        } else {

            var sql = 'SELECT client_id, client_secret FROM server_credentials WHERE client_id=? LIMIT 1';
            con.query(sql, [client_id], function (err, result) {
                if (err) {
                    res.status(500).json({
                        error: err
                    });
                    throw err;
                }
                const server_credential = result[0]
                console.log(server_credential);

                if (!server_credential) {
                    return res.status(401).json({
                        error: new Error('User not found!')
                    });
                }
                bcrypt.compare(req.body.client_secret, server_credential.client_secret).then(
                    (valid) => {
                        if (!valid) {
                            console.log("Pas valide");
                            return res.status(401).json({
                                error: 'Incorrect password!'
                            });
                        }

                        const token = jwt.sign(
                            { client_id: server_credential.client_id },
                            'RANDOM_TOKEN_SECRET',
                            // { expiresIn: '30d' }
                        );

                        res.status(200).json({
                            "access_token": token,
                            "token_type": "Bearer",
                            // "expires_in":86400
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


            )
        }
    }
    // else if (grant_type == "password") {
    //     console.log("Password credentials auth");

    //     const client_id = req.body.client_id
    //     const username = req.body.username
    //     const password = req.body.password

    //     if (!client_id || client_id == "") {
    //         res.status(403).json({
    //             error: "invalid_request",
    //             error_description: "Client_ID not found"
    //         });
    //     } else if (!username || username == "") {
    //         res.status(403).json({
    //             error: "invalid_request",
    //             error_description: "Missing user login info"
    //         });
    //     } else {
    //         var sql = 'SELECT user_id, NNI, password FROM users WHERE email=? OR NNI=? LIMIT 1';
    //         con.query(sql, [username, username], function (err, result) {
    //             if (err) {
    //                 return res.status(500).json({
    //                     error: err
    //                 });
    //             }
    //             console.log(result);

    //             if (!result.length || !result[0].user_id) {
    //                 return res.status(401).json({
    //                     error: 'User not found!'
    //                 });
    //             }
    //             const user = result[0]

    //             bcrypt.compare(req.body.password, user.password).then(
    //                 (valid) => {
    //                     if (!valid) {
    //                         console.log("Pas valide");
    //                         return res.status(401).json({
    //                             error: 'Incorrect password!'
    //                         });
    //                     }

    //                     const token = jwt.sign(
    //                         { 
    //                             NNI: user.NNI,
    //                             user_id: user.user_id
    //                         },
    //                         'RANDOM_TOKEN_SECRET',
    //                         // { expiresIn: '30d' }
    //                     );

    //                     res.status(200).json({
    //                         "access_token": token,
    //                         "token_type": "Bearer",
    //                         // "expires_in":86400
    //                     });



    //                 }
    //             ).catch(
    //                 (error) => {
    //                     res.status(500).json({
    //                         error: error
    //                     });
    //                 }
    //             );

    //         })
    //     }
    // }
    else {
        return res.status(401).json({
            error: "unsupported authentication method"
        });
    }
})

module.exports = router;

