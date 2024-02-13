import express, { Application } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import serverConfig from './config/server.config';
import systemMiddleware from './middlewares/system.middlewares';
import db from './db';
import routes from './routes/index.route';


class Server { 
    public app: Application;
  
    protected port: number; 
  
    private corsOptions: cors.CorsOptions;
  
    constructor() {
      this.app = express();
      this.port =
        serverConfig.NODE_ENV === 'test'
          ? 3236
          : Number(serverConfig.PORT) || 3003;
      this.corsOptions = {
        origin: serverConfig.ALLOWED_ORIGINS
          ? serverConfig.ALLOWED_ORIGINS.split(',')
          : [],
      };
      this.initializeDb();
      this.initializeMiddlewaresAndRoutes();
    }
  
    // Class Method to initialize db
    private async initializeDb(): Promise<void> {
        db.sync()  
        .then(() => {  
          console.log('Database connected successfully');
        })
        .catch((err) => console.log(err));
    }
  
    // Class methods to build middleware and routes
    private initializeMiddlewaresAndRoutes(): void {
      this.app.use(compression());
      if (serverConfig.NODE_ENV === 'development') {
        this.app.use(cors());
      } else {
        this.app.use(cors(this.corsOptions));
      }
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: false }));
      this.app.use(helmet());
      if (['development', 'staging', 'production'].includes(serverConfig.NODE_ENV)) {
        this.app.use(morgan('dev'));
      }
      
      this.app.use(routes)
      this.app.use(systemMiddleware.errorHandler);
    }
  
    // Class Method to initiate app listening
    public start(): void {
      // start payroll grpc server
      
      // initialize RabbitMQ for notification
    //   notificationClient.init();
      this.app.listen(this.port, () => {
        serverConfig.DEBUG(
          `server running on http://localhost:${this.port} in ${serverConfig.NODE_ENV} mode.\npress CTRL-C to stop`,
        );
      });
    }
}
  
const server = new Server();
server.start();