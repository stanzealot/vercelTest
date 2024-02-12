import { Request, Response,NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { UserInstance } from '../../db/models/userModel';
import bcrypt from 'bcryptjs';
import { createUserSchema, generateToken, loginUserSchema, options } from '../../utils/utils';
import { emailVerificationView } from '../../email/emailVerification';
import jwt from 'jsonwebtoken';
import Mailer from '../../email/sendMail'


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


    protected async loginUser(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<Response> {
      try {
        console.log("reach here: ")
        const { email, password } = req.body;
        console.log("body: ",req.body)
        const validationResult = loginUserSchema.validate(req.body, options);
    
        if (validationResult.error) {
          return res.status(400).json({ error: validationResult.error.details[0].message });
        }
        let User = (await UserInstance.findOne({ where: { email: email } })) as unknown as { [key: string]: string };
    
        // if (!User) {
        //   User = (await UserInstance.findOne({ where: { email: email } })) as unknown as { [key: string]: string };
        // }
    
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


    protected async index(req: Request, res: Response, next: NextFunction) {
      try{ 
      
        
        return  res.status(200).json({
            msg:"welcome to moniwizr",
            // count: trainings.count,
            // trainings: trainings.rows
        })
      }catch(err){
          console.log(err)
          res.status(500).json({
          msg:res.status(500).send(err),
          route: 'GET /training'
         })
        };
    }
}