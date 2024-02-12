import { DataTypes, Model } from 'sequelize';
import db from '..';


interface UserAttributes {
    id: string;
    fullname: string;
    email: string;
    password: string;
    phoneNumber: string;
    referral:string;
    isAgreement:boolean;
    avatar: string;
    walletBalance: number;
    role: string;
    isVerified: boolean;
    otp?: number;
    otpExpiration?: number;
}
   
export class UserInstance extends Model<UserAttributes> {}
  
UserInstance.init({
    id: {
        type:DataTypes.STRING, 
        primaryKey:true,
        allowNull:false
    }, 
    fullname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
            msg: 'First name is required',
            },
            notEmpty: {
            msg: 'First name cannot be empty',
            },
        },
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
            msg: 'Email is required',
            },
            notEmpty: {
            msg: 'Email cannot be empty',
            },
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
            msg: 'Password is required',
            },
            notEmpty: {
            msg: 'Password cannot be empty',
            },
        },
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
            msg: 'Phone number is required',
            },
            notEmpty: {
            msg: 'Phone number cannot be empty',
            },
        },
    },
    isAgreement: {
        type:DataTypes.BOOLEAN,
        allowNull:false,
        validate: {
            notNull: { msg: "User must be verified" },
            notEmpty: { msg: "User not verified" },
        },
        defaultValue: false,
    },
    referral: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    walletBalance: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
    
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user',
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    otp: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    otpExpiration: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    },
    {
      sequelize: db,
      modelName: 'User',
    },
);
