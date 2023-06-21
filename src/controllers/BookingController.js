const { BookingService } = require("../services/index");
const { StatusCodes } = require("http-status-codes");
const { successResponse, errorResponse } = require("../utils/common");
const { AppError } = require("../utils/index");

// an in memory db which stores all the keys
const inMemoryDb = {};

async function CreateBooking(req, res) {
  try {
    const response = await BookingService.CreateBooking({
      flightId: req.body.flightId,
      UserId: req.body.UserId,
      noOfSeats: req.body.noOfSeats,
    });
    successResponse.data = response;
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    console.log("controller catching");
    errorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

async function makePayment(req, res) {
  try {
    const idempotencyKey = req.headers["x-idempotency-key"];
    if (!idempotencyKey) {
      errorResponse.message = "idempotency key missing";
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }

    if (inMemoryDb[idempotencyKey]) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Cannot retry on a successful payment" });
    }

    const booking = await BookingService.makePayment({
      totalCost: req.body.totalCost,
      UserId: req.body.UserId,
      bookingId: req.body.bookingId,
    });

    inMemoryDb[idempotencyKey] = idempotencyKey; // storing the idempotencyKey as key-value pair after the payment is successfull 

    successResponse.data = booking;
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    console.log(error);
    errorResponse.message = "error in make payment controller";
    errorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

module.exports = {
  CreateBooking,
  makePayment,
};
