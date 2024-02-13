import { Router } from 'express';
import { UserController } from '../controllers';
import authMiddleware from '../middlewares/auth.middleware';

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
        this.router.route('/forgotpassword').get(this.forgotPassword)
        this.router.route('/change-password/:id').get(this.changePassword)
        this.router.route('/').get(authMiddleware.validateUserAccess, this.index)
        this.router.route('/:id').patch(authMiddleware.validateUserAccess,this.update).get(authMiddleware.validateUserAccess,this.get).delete(authMiddleware.validateUserAccess,this.delete);
      
    }
}
export default new UserRoutes().router;