const { createClient } = require("redis");

let redisClient;

exports.initializeRedisClient = async () => {
  const client = createClient({ url: process.env.REDIS_DATABASE_URL });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  redisClient = client;
};

exports.setRedisValue = async (key, value) => {
  await redisClient.set(key, value);
  return "ok";
};
exports.setRedisJsonValue = async (key, path, value) => {
  await redisClient.json.set(key, path, value);
  return "ok";
};

exports.getRedisValue = async (key) => {
  const data = await redisClient.get(key);
  return data;
};
exports.getRedisJsonValue = async (key, path) => {
  const data = await redisClient.json.get(key, { path });
  return data;
};
exports.getRedisJsonObjectKeys = async (key) => {
  const data = await redisClient.json.objKeys(key);
  return data;
};
