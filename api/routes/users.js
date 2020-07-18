const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Sent a users GET request successfully!'
    })
});

router.post('/', (req, res, next) => {
    res.status(200).json({
        message: 'Sent a users POST request successfully!'
    });
});

router.get('/:userId', (req, res, next) => {
    const id = req.params.userId;
    if (id == '123') {
        res.status(200).json({
            message: 'You discovered the ID',
            id: id,
        });
    } else {
        res.status(200).json({
            message: 'You passed an ID'
        })
    }
});

router.patch('/:userId', (req, res, next) => {
    res.status(200).json({
        message: 'Sent a users PATCH request successfully!',
    });
});

router.delete('/:userId', (req, res, next) => {
    res.status(200).json({
        message: 'Sent a users DELETE request successfully!',
    });
});

module.exports = router;