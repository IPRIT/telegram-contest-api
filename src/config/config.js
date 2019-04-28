import dotenv from 'dotenv';
import { database as localDatabase } from "./env/local";

if (process.env.NODE_ENV !== 'development'
  && process.env.NODE_ENV !== 'test') {
  dotenv.config();
}

const env = process.env.NODE_ENV;

const databaseCredentials = localDatabase;

export const config = {
  "env": env,
  "secureProtocol": env === 'production',
  "ip": "",
  "port": process.env.PORT || 8080,
  "db": {
    ...databaseCredentials,
    "max": 100,
    "min": 1,
    "acquire": 30000,
    "idle": 10000
  },
  "cors": {
    "origins": [ "*" ],
    "methods": [ "POST", "GET", "OPTIONS" ],
    "headers": [ "Content-Type", "X-Token", "X-Requested-With" ]
  },
  "salt": "javascript-is-the-best",
  "telegram": {
    "platform": {
      "ssid": {
        "name": "stel_ssid",
        "value": "5ddf99506a3408b6d1_8972105809606469252"
      },
      "token": {
        "name": "stel_token",
        "value": "3d16d86061a81ff13d9ff6282e3d1fbe7a3d1fb3d1fbe699c8cf1ed1a4001be"
      }
    }
  },
  "socket": {
    "path": "/events",
    "serveClient": false,
    // below are engine.IO options
    "pingInterval": 2000,
    "pingTimeout": 5000,
    "cookie": false
  },
};