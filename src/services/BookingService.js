const { BookingRepo } = require("../repositories/index");
const { Logger, ServerConfig } = require("../config");
const { AppError } = require("../utils/index");
const { StatusCodes } = require("http-status-codes");
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
    if (data.noofSeats > flightData.totalSeats) {
      throw new AppError("No enough seats available", StatusCodes.BAD_REQUEST);
    }

    //2 : price
    const TotalBilling = flightData.price * data.noofSeats;
    const TotalData = {
      ...data,
      totalCost: TotalBilling,
    }; // using spread operator and copying all the data and adding new key totalCost in new object

    //3 : create booking
    const responce = await Bookingrepo.create(TotalData, transactionObj);

    //4 : updating the seats by passing data in callback
    await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${data.flightId}/seats`, {
        seats: data.noofSeats
    });
    

    // 5 : commmit
    await transactionObj.commit();

    return responce;

  } catch (error) {
    // if anything fails transcation will rollback
    await transactionObj.rollback();
    throw error;
  }
}

module.exports = {
  CreateBooking,
};
