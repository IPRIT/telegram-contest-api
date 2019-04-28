export const INSTANCE_CONNECTION_NAME = 'javascript-future:europe-west3:javascript-future-db';

export const database = {
  "host": 'localhost',
  "database": 'contest-parser',
  "username": 'root',
  "password": '115563',
  "dialectOptions": {
    "socketPath": `/cloudsql/${INSTANCE_CONNECTION_NAME}`
  }
};