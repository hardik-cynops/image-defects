import { CommonUtility } from "../common";
import { APIPath } from "../constant";
import { BaseService } from "./base";

class User {
  login(token) {
    const params = CommonUtility.objectToParams({
      Token: token,
    });
    return BaseService.post(`${APIPath.login}?${params}`);
  }
}
const UserService = new User();
Object.freeze(UserService);
export { UserService };
