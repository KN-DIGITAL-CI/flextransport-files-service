import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

export default {
  dev: {
    FLEXMO_PAY_ADMIN_URL: process.env.FLEXMO_PAY_ADMIN_URL_DEV,
    FLEXMO_ADMIN_URL: process.env.FLEXMO_ADMIN_URL_DEV,
    FLEXMO_PAY_PAYMENT_URL: process.env.FLEXMO_PAY_PAYMENT_URL_DEV,
    FLEXMO_LANDING_URL: process.env.FLEXMO_LANDING_URL_DEV,
  },
  preprod: {
    FLEXMO_PAY_ADMIN_URL: process.env.FLEXMO_PAY_ADMIN_URL_PP,
    FLEXMO_ADMIN_URL: process.env.FLEXMO_ADMIN_URL_PP,
    FLEXMO_PAY_PAYMENT_URL: process.env.FLEXMO_PAY_PAYMENT_URL_PP,
    FLEXMO_LANDING_URL: process.env.FLEXMO_LANDING_URL_PP,
  },
  prod: {
    FLEXMO_PAY_ADMIN_URL: process.env.FLEXMO_PAY_ADMIN_URL,
    FLEXMO_ADMIN_URL: process.env.FLEXMO_ADMIN_URL,
    FLEXMO_PAY_PAYMENT_URL: process.env.FLEXMO_PAY_PAYMENT_URL,
    FLEXMO_LANDING_URL: process.env.FLEXMO_LANDING_URL,
  },
};
