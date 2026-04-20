
const { Queues, queues } = require('./lib/queue');
const IORedis = require('ioredis');

async function checkQueue() {
  const status = await Promise.all(
    Object.entries(queues).map(async ([name, queue]) => {
      const counts = await queue.getJobCounts();
      return { name, ...counts };
    })
  );
  console.log('Queue Status:', JSON.stringify(status, null, 2));
  process.exit(0);
}

checkQueue().catch(err => {
  console.error(err);
  process.exit(1);
});
