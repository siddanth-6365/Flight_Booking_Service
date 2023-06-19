const express = require('express');

const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');

const app = express();

// mandatory
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// console.log("statred api")

app.use('/api', apiRoutes);


app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
});
