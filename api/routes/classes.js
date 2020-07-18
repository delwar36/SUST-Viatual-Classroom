const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Sent a classes GET request successfully!'
    })
});

router.post('/', (req, res, next) => {
    res.status(200).json({
        message: 'Sent classes a POST request successfully!'
    })
});
module.exports = router;