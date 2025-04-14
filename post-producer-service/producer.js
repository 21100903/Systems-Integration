const amqp = require('amqplib');
const { faker } = require('@faker-js/faker');

async function produceMessages() {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();

    // Ensure the 'post.created' queue exists
    const queueName = 'post.created';
    await channel.assertQueue(queueName, { durable: true });

    console.log(`[*] Producer is running and sending messages to queue: ${queueName}`);

    // Periodically send synthetic post data
    setInterval(() => {
      const postData = {
        title: faker.lorem.words(5),
        content: faker.lorem.paragraph(),
      };
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(postData)), {
        persistent: true,
      });
      console.log('[x] Sent:', postData);
    }, 5000); // Every 5 seconds
  } catch (error) {
    console.error('Error in producer:', error);
  }
}

produceMessages();
