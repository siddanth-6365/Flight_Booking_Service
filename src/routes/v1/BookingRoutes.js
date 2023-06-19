const express = require('express');

const { BookingController,InfoController } = require('../../controllers');

const router = express.Router();

router.post(
    '/',
    BookingController.CreateBooking
)

router.post(
    '/payments',
    BookingController.makePayment
)

module.exports = router;