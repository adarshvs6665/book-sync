import mongoose from "mongoose";
import config from "config";

export class MongoDbConnection {
  public static async connect(): Promise<void> {
    const uri = config.get<string>("database.uri");

    await mongoose.connect(uri);
  }
}
