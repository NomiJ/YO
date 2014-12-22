var express = require('express'),
    router = express.Router(),
    api = require('../controllers/api');

router.post('/register', api.register);
router.post('/resendVerifyCode', api.resendVerifyCode);
router.post('/forgotPassword', api.forgotPassword);
router.post('/verifyAccount', api.verifyAccount);
router.post('/login', api.login);

router.all('*', function (req, res) {
    res.sendStatus(400)
});

module.exports = router;