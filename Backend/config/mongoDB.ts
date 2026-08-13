import mongoose from "mongoose";

declare const process: {
  env: {
    db_url?: string;
  };
};

 const MongoDB = async (): Promise<void> => {
    try {
        const MONGO_URI = process.env.db_url;

        if (!MONGO_URI) {
            throw new Error("Database URI is missing. Check your .env file setup.");
        }

        const conn = await mongoose.connect(MONGO_URI);
        console.log(`⛓️  MongoDB Connected to: ${conn.connection.host} ✔ Bkash`);
        
    } catch (error) {
        console.error("❌ MongoDB connection failed of Bkash:", error);
        throw error; 
    }
}

export default MongoDB;