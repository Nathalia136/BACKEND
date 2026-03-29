import app from "./app.js"
import { connectDB } from "./db.js"

connectDB();
app.listen(3000, "0.0.0.0")
console.log("Server on port", 3000)

//https://www.youtube.com/watch?v=NmkY4JgS21A&t=198s&ab_channel=FaztCode