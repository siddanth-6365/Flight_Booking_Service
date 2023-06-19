const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const { Booking } = require("../models");
const CrudRepository = require("./crud-repo");

class BookingRepo extends CrudRepository {
  constructor() {
    super(Booking);
  }

  async create(data, transactionObj) {
    const responce = await Booking.create( data , {transaction:transactionObj});
    return responce;
  }
}

module.exports = BookingRepo
