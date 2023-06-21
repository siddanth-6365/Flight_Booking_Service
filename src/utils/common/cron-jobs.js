var cron = require('node-cron');
const {BookingService} = require('../../services')

function cronSchedule(){
    cron.schedule('*/30  * * * *', () => {
        console.log("in cron-job")
        BookingService.cancelOldBooking()
      });
}


module.exports = cronSchedule;