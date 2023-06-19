const express = require('express');

const { InfoController } = require('../../controllers');
const BookingRoutes = require('./BookingRoutes')

const router = express.Router();

router.get('/info', InfoController.info);

// console.log("inside index ")

router.use('/bookings',BookingRoutes)

module.exports = router;