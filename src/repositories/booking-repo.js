const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const { Booking } = require("../models");
const CrudRepository = require("./crud-repo");

class BookingRepo extends CrudRepository {
  constructor() {
    super(Booking);
  }

  async create(data, transactionObj) {
    const responce = await Booking.create(data, {
      transaction: transactionObj,
    });
    return responce;
  }

  async get(data, transactionObj) {
    const response = await Booking.findByPk(data, {
      transaction: transactionObj,
    });
    if (!response) {
      throw new AppError(
        "Not able to fund the resource",
        StatusCodes.NOT_FOUND
      );
    }
    return response;
  }

  async update(id, data, transactionObj) {
    const response = await Booking.update(
      data,
      {
        where: {
          id: id,
        },
      },
      {
        transaction: transactionObj,
      }
    );
    return response;
  }

  async cancelOldbookings(timestamp) {
    const response = await Booking.update(
      {
        status: "CANCELLED",
      },
      {
        where: {
          [Op.and]: [
            {
              createdAt: {
                [Op.lt]: timestamp,
              },
            },
            {
              status: {
                [Op.ne]: "BOOKED",
              },
            },
            {
              status: {
                [Op.ne]: "CANCELLED",
              },
            },
          ],
        },
      }
    );
    return response;
  }
}

module.exports = BookingRepo;
