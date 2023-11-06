import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const checkFileType = function (file, cb) {
  //Allowed file extensions
  const fileTypes = /jpeg|jpg|png|gif|svg|jfif/; //check extension names

  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "File format is invalid, try using jpeg|jpg|png|gif|svg|jfif image formates"
      )
    );
  }
};
//Setting storage engine
const storageEngine = multer.diskStorage({
  destination: "./uploads",
  //   destination: "uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      `${uuidv4()}-${file.originalname.toLowerCase().split(" ").join("-")}`
    );
  },
});
//initializing multer
export const upload = multer({
  storage: storageEngine,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
  limits: {
    files: 10,
    fileSize: 50 * 1024 * 1024, //50mb,
  },
});

// import multer from "multer"

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + '-' + file.originalname);
//     },
// });

// export const upload = multer({ storage });

// import multer from "multer"

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + '-' + file.originalname);
//     },
// });

// export const upload = multer({ storage });
