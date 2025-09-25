import mongoose from 'mongoose';

import dotenv from 'dotenv';
import companyModel from '../models/tiers-model/company.model';
import Driver from '../models/tiers-model/drivers.model';
dotenv.config();
// connect to TIERS DB
const TIERS_URL = process?.env?.DBLINK?.replace(
  'env',
  process?.env?.NODE_ENV as string
);

const tiersConn = mongoose.createConnection(process?.env?.DBLINK as string);

const initializeTiersModels = async () => {
  const CompanyModel = tiersConn.model('Company', companyModel as any);
  const DriverModel = tiersConn.model('Driver', Driver as any);
  return { DriverModel, CompanyModel };
};

export default initializeTiersModels;
