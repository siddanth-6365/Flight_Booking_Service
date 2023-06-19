const { BookingService } = require("../services/index");
const { StatusCodes } = require("http-status-codes");
const { successResponse, errorResponse } = require("../utils/common");
const { AppError } = require("../utils/index");

async function CreateBooking(req, res) {
    try {
        // console.log("body",req.body);
        const response = await BookingService.CreateBooking({
            flightId: req.body.flightId,
            UserId: req.body.userId,
            noofSeats: req.body.noofSeats
        });
        successResponse.data = response;
        return res
                .status(StatusCodes.OK)
                .json(successResponse);
    } catch(error) {
        console.log("controller catching")
        errorResponse.error = error;
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(errorResponse);
    }
}

module.exports = {
    CreateBooking
};
