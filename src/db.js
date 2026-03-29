import mongoose from "mongoose";


const DB_USER = "admin";
const DB_PASSWORD = "password123";
const DB_HOST = "192.168.20.36";
const DB_PORT = "28017";
const DB_NAME = "appdb";

const mongoURI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
export const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("DB is connected");
        console.log(mongoURI);
    } catch (error) {
        console.log(error);
    }
    
}


