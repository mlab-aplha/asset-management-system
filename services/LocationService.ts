import { BaseService } from "./BaseService";
import { db } from "../backend-firebase/src/firebase/firebase/config";

export interface Location {
  id?: string;
  name: string;
  address: string;
}

export const LocationService = new BaseService<Location>(db, "locations");
