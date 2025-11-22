// import { createClient, RedisClientType } from "redis";

// export class RedisService {
//   private static instance: RedisService;
//   private client: RedisClientType;

//   private constructor() {
//     this.client = createClient({
//       url: process.env.REDIS_URL || "redis://localhost:6379",
//     });

//     this.client.on("error", err => console.error("Redis Error:", err));
//   }

//   // Singleton pattern to avoid multiple Redis connections
//   static getInstance(): RedisService {
//     if (!RedisService.instance) {
//       RedisService.instance = new RedisService();
//     }
//     return RedisService.instance;
//   }

//   async connect() {
//     if (!this.client.isOpen) {
//       await this.client.connect();
//     }
//   }

//   getClient() {
//     return this.client;
//   }

//   // Optional convenience methods:
//   async set(key: string, value: string, expiryInSeconds?: number) {
//     // if (expiryInSeconds) {
//     //   await this.client.set(key, value, { EX: expiryInSeconds });
//     // } else {
//     //   await this.client.set(key, value);
//     // }
//     await this.client.setEx(key, expiryInSeconds || 60, value);
//   }

//   async get(key: string) {
//     return await this.client.get(key);
//   }

//   async del(key: string) {
//     return await this.client.del(key);
//   }
// }

// const redisServiceInstance = RedisService.getInstance();
// export default redisServiceInstance;