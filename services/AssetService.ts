import { BaseService } from "./BaseService";
import { db } from "../backend-firebase/src/firebase/firebase/config";

export interface Asset {
  id?: string;
  name: string;
  type: string;
  value: number;
  locationId?: string;
}

export const AssetService = new BaseService<Asset>(db, "assets");
