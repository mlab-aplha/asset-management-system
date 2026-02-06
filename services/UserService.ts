import { BaseService } from "./BaseService";
import { db } from "../backend-firebase/src/firebase/firebase/config";

export interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
}

export const UserService = new BaseService<User>(db, "users");
