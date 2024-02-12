import { config } from 'dotenv';
import debug from 'debug';

config();

class ServerConfig {
  public DEBUG = debug('dev');

  public NODE_ENV = process.env.NODE_ENV;

  public PORT = process.env.PORT;

  public GRPC_URL = process.env.GRPC_URL;

  public AUTHENTICATION_GRPC_URL = process.env.AUTHENTICATION_GRPC_URL;

  public UTILITY_GRPC_URL = process.env.UTILITY_GRPC_URL;

  public ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS;

  public RABBITMQ_URI = process.env.RABBITMQ_URI;

  public REDIS_HOST = process.env.REDIS_HOST;

  public REDIS_PORT = Number(process.env.REDIS_PORT);

  public REDIS_ACCESS_KEY = process.env.REDIS_ACCESS_KEY;

  public DB_USERNAME = process.env.DB_USERNAME;

  public DB_PASSWORD = process.env.DB_PASSWORD;

  public DB_HOST = process.env.DB_HOST;

  public DB_PORT = Number(process.env.DB_PORT);

  public DB_NAME = process.env.DB_NAME;

  public DB_URI = process.env.DB_URI;

  public PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
}

export default new ServerConfig();