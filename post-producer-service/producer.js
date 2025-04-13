// producer.js
const amqp = require('amqplib');
const readline = require('readline');

async function startProducer() {
  try {
    // Connect to RabbitMQ running on localhost
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();
    const queueName = 'post.created';
    await channel.assertQueue(queueName, { durable: true });
    
    console.log(`[*] Connected to RabbitMQ. Ready to send messages to the "${queueName}" queue.`);
    console.log("Type your post data in JSON format and press Enter. For example:");
    console.log(`{"title": "Manual Post", "content": "This is manually inserted post data."}`);
    console.log(`Type 'exit' to quit.`);
    
    // Set up readline interface for manual input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.setPrompt("Enter post data in JSON format: ");
    rl.prompt();
    
    rl.on('line', (line) => {
      const trimmedLine = line.trim();
      if (trimmedLine.toLowerCase() === 'exit') {
        console.log("Exiting manual input mode...");
        rl.close();
        connection.close();
        process.exit(0);
      }
      
      try {
        // Parse the JSON input
        const postData = JSON.parse(trimmedLine);
        
        // Send the post data to RabbitMQ
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(postData)), { persistent: true });
        console.log("[x] Sent:", postData);
      } catch (err) {
        console.error("Invalid JSON or error sending message:", err.message);
      }
      
      rl.prompt();
    });
    
  } catch (error) {
    console.error("Error starting producer:", error);
  }
}

startProducer();
