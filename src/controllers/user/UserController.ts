import { Request, Response,NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { UserInstance } from '../../db/models/userModel';
import bcrypt from 'bcryptjs';
import { changePasswordSchema, createUserSchema, generateToken, loginUserSchema, options, userUpdateSchema } from '../../utils/utils';
import { emailVerificationView, forgotPasswordVerification } from '../../email/emailVerification';
import jwt from 'jsonwebtoken';
import Mailer from '../../email/sendMail'
import serverConfig from '../../config/server.config';


const passPhrase = process.env.JWT_SECRETE as string;
const fromUser = process.env.FROM as string;
const subject = process.env.SUBJECT as string;
export default class UserController {

    protected async create(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<Response> {
      try {
        let newId = uuidv4();
        const validationResult = createUserSchema.validate(req.body, options);
    
        if (validationResult.error) {
          return res.status(400).json({
            error: validationResult.error.details[0].message,
          });
        }
    
        const duplicateEmail = await UserInstance.findOne({
          where: { email: req.body.email },
        });
        if (duplicateEmail) {
          return res.status(409).json({
            error: 'email is already taken',
          });
        }
    
        const duplicatePhoneNumber = await UserInstance.findOne({
          where: {
            phoneNumber: req.body.phoneNumber,
          },
        });
    
        if (duplicatePhoneNumber) {
          return res.status(409).json({
            error: 'phone number already exists',
          });
        }
    
        const passwordHash = await bcrypt.hash(req.body.password, 8);
    
        const record = await UserInstance.create({
          id: newId,
          fullname: req.body.fullname,
          avatar:'',
          email: req.body.email,
          password: passwordHash,
          phoneNumber: req.body.phoneNumber,
          referral:req.body.referral,
          isAgreement:req.body.isAgreement,
          isVerified: false,
          walletBalance: 0.0,
          role: 'user',
        });
    
        const token = jwt.sign({ id: newId }, passPhrase, { expiresIn: '30mins' });
        const html = emailVerificationView(token);
        await Mailer.sendEmail(fromUser, req.body.email, subject, html);
    
        return res.status(201).json({
          message: 'User created successfully',
          record,
          // token,
        });
      } catch (error) {
        // serverConfig.DEBUG(
        //   `Error in user verification get controller method: ${error}`,
        // );
        console.log(error);
        next(error);
      }
    }


    protected async loginUser(req: Request,res: Response,next: NextFunction): Promise<Response> {
      try {
        
        const { email, password } = req.body;

        const validationResult = loginUserSchema.validate(req.body, options);
    
        if (validationResult.error) {
          return res.status(400).json({ error: validationResult.error.details[0].message });
        }
        let User = (await UserInstance.findOne({ where: { email: email } })) as unknown as { [key: string]: string };
    
        if (!User) {
          return res.status(403).json({ error: 'User not found' });
        }
    
        if (!User.isVerified) {
          return res.status(403).json({ error: 'User not verified' });
        }
    
        const { id } = User;
    
        const token = generateToken({ id });
    
        const validUser = await bcrypt.compare(password, User.password);
        if (!validUser) {
          return res.status(401).json({ error: 'Password do not match' });
        }
        if (validUser) {
          return res.status(200).json({ message: 'Login successful', token, User });
        }
      } catch (error) {
        // serverConfig.DEBUG(
        //   `Error in user verification get controller method: ${error}`,
        // );
        console.log(error);
        next(error);
      }
    }

    protected async verifyUser(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<unknown> {
      try {
        const { token } = req.params;

        const verified = jwt.verify(token, passPhrase);
    
        const { id } = verified as { [key: string]: string };
    
        const record = await UserInstance.findOne({
          where: {
            id: id,
          },
        });
    
        await record?.update({
          isVerified: true,
        });
    
      return res.status(302).redirect(`${process.env.FRONTEND_URL}/user/login`);
      } catch (error) {
        // serverConfig.DEBUG(
        //   `Error in user verification get controller method: ${error}`,
        // );
        console.log(error);
        next(error);
      }
    }

    protected async forgotPassword(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<unknown> {
      try {
        const { email } = req.body;
        const user = (await UserInstance.findOne({
          where: {
            email: email,
          },
        })) as unknown as { [key: string]: string };

        if (!user) {
          return res.status(404).json({
            error: 'email not found',
          });
        }
        const { id } = user;
        const html = forgotPasswordVerification(id);
        await Mailer.sendEmail(fromUser, req.body.email, subject, html);

        return res.status(200).json({
          message: 'Check email for the verification link',
        });

      } catch (error) {
        serverConfig.DEBUG(
          `Error in forget password method: ${error}`,
        );
        console.log(error);
        next(error);
      }
    }


    protected async changePassword(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<unknown> {
      try {
        const { id } = req.params;

        const validationResult = changePasswordSchema.validate(req.body, options);
        if (validationResult.error) {
          return res.status(400).json({
            error: validationResult.error.details[0].message,
          });
        }

        const user = await UserInstance.findOne({
          where: {
            id: id,
          },
        });
        if (!user) {
          return res.status(403).json({
            error: 'user does not exist',
          });
        }
        
        const passwordHash = await bcrypt.hash(req.body.password, 8);

        await user?.update({
          password: passwordHash,
        });
        return res.status(200).json({
          message: 'Password Successfully Changed',
        });

      } catch (error) {
        serverConfig.DEBUG(
          `Error in change password method: ${error}`,
        );
        console.log(error);
        next(error);
      }
    }

    protected async update(req: Request, res: Response, next: NextFunction): Promise<Response> {
      try {
        const { id } = req.params;
        const record = await UserInstance.findOne({ where: { id } });

        if (!record) {
          return res.status(400).json({ error: 'Invalid ID, User not found' });
        }

        const updateRecord = {
          avatar:req.body?.avatar,
          email: req.body?.email,
          phoneNumber: req.body?.phoneNumber,
          referral:req.body?.referral,
          isAgreement:req.body?.isAgreement,
          walletBalance: req.body?.walletBalance,
        };

        const validateUpdate = userUpdateSchema.validate(updateRecord, options);

        if (validateUpdate.error) {
          return res.status(400).json({ error: validateUpdate.error.details[0].message });
        }
    
        const updateUserRecord = await record?.update(updateRecord);
    
        return res.status(200).json({
          message: 'Update Successful',
          record: updateUserRecord,
        });

      } catch (error) {
        console.log(error)
        return res.status(500).json({
          error: 'Failed to update record',
          route:'/user/:id'
        });
      }
    }


    protected async index(req: Request, res: Response, next: NextFunction) {
      try{ 
          const users = await UserInstance.findAll();
          return res.status(200).json({ status: 200, msg: 'Users found successfully',users });
        }catch(err){
            console.log(err)
            res.status(500).json({
            msg:res.status(500).send(err),
          })
        };
    }

    protected async get(req: Request, res: Response, next: NextFunction) {
      try{ 
        const { id } = req.params;
        const user = await UserInstance.findOne({where: { id }});
        return res.status(200).json({
          message: 'user fetched successful',
          user,
        });
        }catch(err){
            console.log(err)
            res.status(500).json({
            msg:res.status(500).send(err),
            route:'/user/:id'
          })
        };
    }

    protected async delete(req: Request, res: Response, next: NextFunction): Promise<Response> {
      try {
      const { params: { id } } = req;

       const record = await UserInstance.findOne({where: {id}})
       if(!record){
          return res.status(404).json({
             msg:"Cannot find user"
          })
        }
        const deletedRecord = await record.destroy()
        return res.status(200).json({
          msg: 'user deleted successfully.',
        });
      } catch (err) {
        console.log(err)
          res.status(500).json({
          msg:res.status(500).send(err),
          route:'/user/:id'
         })
      }
    }
}