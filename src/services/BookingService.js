const { BookingRepo } = require("../repositories/index");
const { Logger, ServerConfig } = require("../config");
const { AppError } = require("../utils/index");
const { StatusCodes } = require("http-status-codes");
const { successResponse, errorResponse } = require("../utils/common");
const axios = require("axios");
const db = require("../models");

const Bookingrepo = new BookingRepo();

async function CreateBooking(data) {
  const transactionObj = await db.sequelize.transaction();

  try {
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${data.flightId}`
    );
    const flightData = flight.data.data;

    //1 : checks
    if (data.noOfSeats > flightData.totalSeats) {
      throw new AppError("No enough seats available", StatusCodes.BAD_REQUEST);
    }

    //2 : price
    const TotalBilling = flightData.price * data.noOfSeats;
    const TotalData = {
      ...data,
      totalCost: TotalBilling,
    }; // using spread operator and copying all the data and adding new key totalCost in new object

    console.log("inside service Total Data  :", TotalData);

    //3 : create booking
    const responce = await Bookingrepo.create(TotalData, transactionObj);

    //4 : updating the seats by passing data in callback
    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${data.flightId}/seats`,
      {
        seats: TotalData.noOfSeats,
      }
    );

    // 5 : commmit
    await transactionObj.commit();

    return responce;
  } catch (error) {
    // if anything fails transcation will rollback
    await transactionObj.rollback();
    throw error;
  }
}

async function makePayment(data) {
  const transactionObj = await db.sequelize.transaction();

  try {
    const bookingDetails = await Bookingrepo.get(
      data.bookingId,
      transactionObj
    );

    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();

    if (currentTime - bookingTime > 300000) {
      await cancelBooking(data.bookingId);
      throw new AppError(
        "The booking time has been expired",
        StatusCodes.BAD_REQUEST
      );
    }

    if (bookingDetails.totalCost != data.totalCost) {
      throw new AppError(
        "The amount of the payment doesnt match",
        StatusCodes.BAD_REQUEST
      );
    }

    if (bookingDetails.UserId != data.UserId) {
      throw new AppError(
        "The user corresponding to the booking doesnt match",
        StatusCodes.BAD_REQUEST
      );
    }

    await Bookingrepo.update(
      data.bookingId,
      { status: "BOOKED" },
      transactionObj
    );

    await transactionObj.commit();
    return true;
  } catch (error) {
    await transactionObj.rollback();
    throw error;
  }
}

async function cancelBooking(bookingId) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await Bookingrepo.get(bookingId, transaction);

    // already cancelled then commit it
    if (bookingDetails.status == "CANCELLED") {
      await transaction.commit();
      return true;
    }
    // increase the flights seats
    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${bookingDetails.flightId}/seats`,
      {
        seats: bookingDetails.noOfSeats,
        dec: 0,
      }
    );
    await Bookingrepo.update(bookingId, { status: "CANCELLED" }, transaction);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function cancelOldBooking() {
  try {
    const time = new Date(Date.now() - 1000 * 300);
    const responce = await Bookingrepo.cancelOldbookings(time);
    return responce;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  CreateBooking,
  makePayment,
  cancelOldBooking
};
