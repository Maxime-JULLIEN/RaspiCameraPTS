const express = require("express");
const router = express.Router()
const webpush = require('web-push')

const token_verify = require("./middleware/token_verify");

webpush.setVapidDetails(process.env.WEB_PUSH_CONTACT, process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY)

// router.get("/", token_verify, (req, res) => {
//     const con = req.app.locals.db
//     var sql = "SELECT endpoint, auth, p256dh FROM user_notification WHERE user_id=?";
//     con.query(sql, [req.userId], function (err, result) {
//         if (err) return res.status(500).send({ message: err.message });
//         result = result.map(el => {
//             return {
//                 endpoint: el.endpoint,
//                 keys: {
//                     auth: el.auth,
//                     p256dh: el.p256dh
//                 }
//             }
//         })
//         result.forEach(element => {
//             const payload = JSON.stringify({
//                 title: 'Your camera detect something',
//                 body: 'Click here to open video streaming',
//             })
//             webpush.sendNotification(element, payload)
//         });
//         console.log(result);
//         res.json({
//             url: result
//         })
//     })
// })

router.post("/notifyByCameraId/:camera_id", token_verify, (req, res) => {
    const con = req.app.locals.db
    console.log("Request notif");

    var sql = "select endpoint, auth, p256dh from user_notification join camera_user on user_notification.user_id = camera_user.user_id join cameras on camera_user.camera_id = cameras.id where cameras.id=1 ";
    con.query(sql, [req.params.camera_id], function (err, result) {
        if (err) {
            console.log(err);
            return res.status(500).send({ message: err.message });
        }
        result = result.map(el => {
            return {
                endpoint: el.endpoint,
                keys: {
                    auth: el.auth,
                    p256dh: el.p256dh
                }
            }
        })
        result.forEach(element => {
            // const payload = JSON.stringify({
            //     title: 'Your camera detect something',
            //     body: 'Click here to open video streaming',
            //     // image: "https://rcp.linkable.tech/static/home/dark-light.png",
            //     image: "path/to/image.jpg",
            //     tag: "new...",
            //     url: "/your-url.html"
            // })

            const payload = JSON.stringify({
                title: 'Votre caméra a détecté quelque chose',
                text: 'Cliquer ici pour accéder au flux vidéo',
                data: "/app/camera/" + req.params.camera_id,
                image: "/static/home/dark-light.png",
                actions: [{ action: "Voir", title: "Voir" }]
            });

            webpush.sendNotification(element, payload)
                .then(result => {
                    console.log("Good notif for " + element.endpoint)
                    // console.log(result)
                })
                .catch(e => {
                    console.log("Error while sending push notif")

                    var sql = "DELETE FROM user_notification WHERE user_notification.endpoint = ?"
                    con.query(sql, [element.endpoint])
                    console.log(e)
                })
        });
        // console.log(result);
        res.send("OK")
    })
})

router.post('/subscribe', token_verify, (req, res) => {
    const con = req.app.locals.db
    var subscription = req.body

    var sql = "INSERT INTO user_notification SET ?";
    con.query(sql, [{
        endpoint: subscription.endpoint,
        auth: subscription.keys.auth,
        p256dh: subscription.keys.p256dh,
        user_id: req.userId
    }
    ], function (err, result) {
        if (err) {
            console.log(err.message);
            return res.status(500).send({ message: err.message });
        }
        const payload = JSON.stringify({
            title: 'Settings updated',
            text: 'Notifications are activated',
        })

        webpush.sendNotification(subscription, payload)
            .then(result => {
                console.log("Good notif")
                // console.log(result)
            })
            .catch(e => {
                console.log("Error while sending push notif")
                // console.log(e)
            })
        res.status(200).json({ 'success': true })
    });
});

module.exports = router;