import { Router } from 'express';
import { UserController } from '../controllers';

class UserRoutes extends UserController{
    public router: Router;
  
    constructor() {
      super();
      this.router = Router();
      this.routes();
    }
  
    private routes(): void {
      
        this.router.route('/register').post(this.create).get(this.index)
        this.router.route('/login').post(this.loginUser)
        this.router.route('/verify/:token').get(this.verifyUser)
     
  }
}
export default new UserRoutes().router;