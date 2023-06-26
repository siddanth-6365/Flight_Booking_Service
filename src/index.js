const express = require('express');

const { ServerConfig ,Queue } = require('./config');
const apiRoutes = require('./routes');
// const {CRONS} = require('./utils/common')  by this error can occur
const CRON = require('./utils/common/cron-jobs');

const app = express();


// mandatory
app.use(express.json());
app.use(express.urlencoded({extended: true}));




// app.use("/BookingService/api", apiRoutes); no need as we renamed in auth service

app.use('/api', apiRoutes);


app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    CRON();
    
    Queue.connectQueue();
   console.log(" connected queue !")

});
