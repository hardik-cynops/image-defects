import { CommonUtility } from "../common";
import { APIPath } from "../constant";
import { BaseService } from "./base";

class ImageDefect {
  save(data) {
    return BaseService.post(APIPath.saveDefects, data);
  }

  audit(id) {
    const params = {
      auditId: id,
    };
    return BaseService.get(
      `${APIPath.audits}?${CommonUtility.objectToParams(params)}`,
    );
  }

  images() {
    return BaseService.get(APIPath.images);
  }
}
const ImageDefectService = new ImageDefect();
Object.freeze(ImageDefectService);
export { ImageDefectService };
