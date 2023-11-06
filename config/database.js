import mongoose from "mongoose";

const connectDatabase = () => {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(process.env.MONGODB_URI)
    .then((c) => {
    console.log(`-------------------------------------------`);
      console.log(`Mongodb connect to: ${c.connection.host}`);
    console.log(`-------------------------------------------`);

    })
    .catch((e) => {
      console.log(e);
    });
};

export default connectDatabase;
