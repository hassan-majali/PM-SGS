import multer from "multer";
import path from "path";
import fs from "fs";

function makeStorage(subfolder: string) {
  return multer.diskStorage({
    destination(_req, _file, cb) {
      const dir = path.join(__dirname, "../../uploads", subfolder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(_req, file, cb) {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

export const uploadDeliverable = multer({ storage: makeStorage("deliverables") });
export const uploadPayment = multer({ storage: makeStorage("payment-plans") });
export const uploadDocument = multer({ storage: makeStorage("documents") });
export const uploadExcel = multer({ storage: makeStorage("temp") });
