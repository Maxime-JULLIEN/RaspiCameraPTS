const express = require("express");
const router = express.Router()

const auth = require("./middleware/token_verify");

router.put("/", (req, res) => {
    const con = req.app.locals.db
    const token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;

    console.log(req.body);

    if (token) {
        if (req.body.ADCO) {
            var sql = "SELECT pdl FROM erl WHERE adco=? AND token=? LIMIT 1";
            con.query(sql, [req.body.ADCO, token], function (err, result) {
                if (err) throw err;
                var PDL = result[0].pdl;
               
 

                if (req.body.PAPP) {
                    if (req.body.BASE) {
    
                        req.app.locals.io.emit('power', { PDL: PDL, PAPP: req.body.PAPP, BASE: req.body.BASE }); // This will emit the event to all connected sockets
                    // var sql = 'SELECT emailId, date, subject, snippet, filename, processed  FROM emails WHERE userId=? ORDER BY emailId DESC  LIMIT 100';
                // con.query(sql, [adr], function (err, result) {
                //     if (err) throw err;
                //     res.json({
                //         data: result
                //     })
                // });
                        console.log(result);
    
                        return res.json({ response: 'OK' })
                    } else {
                        return res.status('404').send('No Specified BASE')
                    }
                }
                else {
                    return res.status('404').send('No Specified PAPP')
                }

            });
        } else {
            return res.status('404').send('No Specified ADC0')
        }
    } else {
        return res.status('401').send('Missing auth token')
    }
})

router.get("/:PDL", auth, (req, res) => {

    if (req.params) {
        if (req.params.PDL) {

            req.app.locals.redis.get("PDL_" + req.params.PDL, function (err, reply) {
                // reply is null when the key is missing
                console.log(reply);
                res.json({ power: reply })

            });
        }
        else {
            res.status('404').send('No Specified PDL')
        }
    }
    else {
        res.status('500').send('Error, no parameters')
    }

})


router.put("/:PDL/power/:power", auth, (req, res) => {
    if (req.params) {
        if (req.params.PDL) {
            if (req.params.power) {
                req.app.locals.redis.set("PDL_" + req.params.PDL, req.params.power);
                req.app.locals.io.emit('power', { PDL: req.params.PDL, value: req.params.power }); // This will emit the event to all connected sockets
                res.send('OK')
            }
            else {
                res.status('500').send('No specified power')
            }
        }
        else {
            res.status('500').send('No Specified PDL')
        }
    }
    else {
        res.status('500').send('Error, no parameters')
    }
})

module.exports = router;