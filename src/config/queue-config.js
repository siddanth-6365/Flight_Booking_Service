const amqplib = require("amqplib");

let channel, connection;

async function connectQueue() {
    try {
        connection = await amqplib.connect("amqp://localhost");
        channel = await connection.createChannel();

        await channel.assertQueue("noti-queue");
    } catch(error) {
        console.log(error);
    }
}

async function sendData(data) {
    try {
        const queue = 'tasks'
        await channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
    } catch(error) {
        console.log("queue error", error);
    }
}

module.exports = {
    connectQueue,
    sendData
}