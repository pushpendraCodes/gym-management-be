const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const port = process.env.PORT || 4000;
const mongoose = require("mongoose");
const env = require("dotenv");
env.config();
const cookieParser = require("cookie-parser")
const cors = require("cors");
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  exposedHeaders: ["X-Total-Count"],
}))

app.use(express.json());
const memberRoutes = require("./routes/MemberRoutes");
const GymRoutes = require("./routes/GymRoutes");
const AuthRoutes = require("./routes/AuthRoutes");
const verifyJWT = require("./middlewares/authMiddileware");


app.get("/", (req, res) => {
  res.send("we are filtness managment");
});

// routes
app.use("/member", memberRoutes);
app.use("/gym",  GymRoutes);
app.use("/auth", AuthRoutes);

// const convertToDateFormat = (dateString) => {
//   const date = new Date(dateString); // Parse the input date string

//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so add 1
//   const day = String(date.getDate()).padStart(2, "0"); // Ensure day is 2 digits

//   return `${year}-${month}-${day}`;
// };
// app.post("/bulkpost", async (req, res) => {
//   const dummyMembers = [

//     {
//       firstName: "Jane",
//       lastName: "Smith",
//       mobile: "0987654321",
//       gender: 2,
//       address: "456 Oak St",
//       training: 2,
//       fees: 150,
//     },
//     {
//       firstName: "Bob",
//       lastName: "Johnson",
//       mobile: "2345678901",
//       gender: 1,
//       address: "789 Pine St",
//       training: 1,
//       fees: 120,
//     },
//     {
//       firstName: "Alice",
//       lastName: "Davis",
//       mobile: "3456789012",
//       gender: 2,
//       address: "321 Elm St",
//       training: 2,
//       fees: 130,
//     },
//     {
//       firstName: "Mike",
//       lastName: "Brown",
//       mobile: "4567890123",
//       gender: 1,
//       address: "654 Cedar St",
//       training: 1,
//       fees: 140,
//     },
//     {
//       firstName: "Emily",
//       lastName: "Wilson",
//       mobile: "5678901234",
//       gender: 2,
//       address: "987 Maple St",
//       training: 2,
//       fees: 160,
//     },
//     {
//       firstName: "David",
//       lastName: "White",
//       mobile: "6789012345",
//       gender: 1,
//       address: "111 Birch St",
//       training: 1,
//       fees: 110,
//     },
//     {
//       firstName: "Sarah",
//       lastName: "Martinez",
//       mobile: "7890123456",
//       gender: 2,
//       address: "222 Chestnut St",
//       training: 2,
//       fees: 170,
//     },
//     {
//       firstName: "Chris",
//       lastName: "Garcia",
//       mobile: "8901234567",
//       gender: 1,
//       address: "333 Ash St",
//       training: 1,
//       fees: 150,
//     },
//     {
//       firstName: "Laura",
//       lastName: "Rodriguez",
//       mobile: "9012345678",
//       gender: 2,
//       address: "444 Walnut St",
//       training: 2,
//       fees: 140,
//     },
//     {
//       firstName: "James",
//       lastName: "Lee",
//       mobile: "0123456789",
//       gender: 1,
//       address: "555 Spruce St",
//       training: 1,
//       fees: 125,
//     },
//     {
//       firstName: "Megan",
//       lastName: "Hernandez",
//       mobile: "1123456789",
//       gender: 2,
//       address: "666 Willow St",
//       training: 2,
//       fees: 180,
//     },
//     {
//       firstName: "Ethan",
//       lastName: "Lopez",
//       mobile: "1223456789",
//       gender: 1,
//       address: "777 Redwood St",
//       training: 1,
//       fees: 135,
//     },
//     {
//       firstName: "Hannah",
//       lastName: "Gonzalez",
//       mobile: "1323456789",
//       gender: 2,
//       address: "888 Fir St",
//       training: 2,
//       fees: 155,
//     },
//     {
//       firstName: "Ryan",
//       lastName: "Perez",
//       mobile: "1423456789",
//       gender: 1,
//       address: "999 Sycamore St",
//       training: 1,
//       fees: 145,
//     },
//     {
//       firstName: "Sophia",
//       lastName: "Moore",
//       mobile: "1523456789",
//       gender: 2,
//       address: "1110 Redwood St",
//       training: 2,
//       fees: 165,
//     },
//     {
//       firstName: "Daniel",
//       lastName: "Taylor",
//       mobile: "1623456789",
//       gender: 1,
//       address: "1210 Cypress St",
//       training: 1,
//       fees: 130,
//     },
//     {
//       firstName: "Olivia",
//       lastName: "Anderson",
//       mobile: "1723456789",
//       gender: 2,
//       address: "1310 Juniper St",
//       training: 2,
//       fees: 145,
//     },
//     {
//       firstName: "Matthew",
//       lastName: "Thomas",
//       mobile: "1823456789",
//       gender: 1,
//       address: "1410 Pine St",
//       training: 1,
//       fees: 140,
//     },
//     {
//       firstName: "Isabella",
//       lastName: "Jackson",
//       mobile: "1923456789",
//       gender: 2,
//       address: "1510 Cedar St",
//       training: 2,
//       fees: 150,
//     },
//     {
//       firstName: "Joseph",
//       lastName: "Martinez",
//       mobile: "2023456789",
//       gender: 1,
//       address: "1610 Oak St",
//       training: 1,
//       fees: 160,
//     },
//     {
//       firstName: "Charlotte",
//       lastName: "Harris",
//       mobile: "2123456789",
//       gender: 2,
//       address: "1710 Maple St",
//       training: 2,
//       fees: 170,
//     },
//     {
//       firstName: "Andrew",
//       lastName: "Clark",
//       mobile: "2223456789",
//       gender: 1,
//       address: "1810 Birch St",
//       training: 1,
//       fees: 135,
//     },
//     {
//       firstName: "Abigail",
//       lastName: "Lewis",
//       mobile: "2323456789",
//       gender: 2,
//       address: "1910 Willow St",
//       training: 2,
//       fees: 150,
//     },
//     {
//       firstName: "Benjamin",
//       lastName: "Walker",
//       mobile: "2423456789",
//       gender: 1,
//       address: "2010 Chestnut St",
//       training: 1,
//       fees: 120,
//     },
//     {
//       firstName: "Mia",
//       lastName: "Allen",
//       mobile: "2523456789",
//       gender: 2,
//       address: "2110 Elm St",
//       training: 2,
//       fees: 165,
//     },
//     {
//       firstName: "Lucas",
//       lastName: "Young",
//       mobile: "2623456789",
//       gender: 1,
//       address: "2210 Ash St",
//       training: 1,
//       fees: 140,
//     },
//     {
//       firstName: "Avery",
//       lastName: "King",
//       mobile: "2723456789",
//       gender: 2,
//       address: "2310 Sycamore St",
//       training: 2,
//       fees: 150,
//     },
//     {
//       firstName: "Samuel",
//       lastName: "Scott",
//       mobile: "2823456789",
//       gender: 1,
//       address: "2410 Spruce St",
//       training: 1,
//       fees: 155,
//     },
//     {
//       firstName: "Lily",
//       lastName: "Green",
//       mobile: "2923456789",
//       gender: 2,
//       address: "2510 Fir St",
//       training: 2,
//       fees: 170,
//     },
//     {
//       firstName: "Gabriel",
//       lastName: "Baker",
//       mobile: "3023456789",
//       gender: 1,
//       address: "2610 Juniper St",
//       training: 1,
//       fees: 140,
//     },
//     {
//       firstName: "Ella",
//       lastName: "Adams",
//       mobile: "3123456789",
//       gender: 2,
//       address: "2710 Cypress St",
//       training: 2,
//       fees: 150,
//     },
//     {
//       firstName: "Logan",
//       lastName: "Nelson",
//       mobile: "3223456789",
//       gender: 1,
//       address: "2810 Oak St",
//       training: 1,
//       fees: 160,
//     },
//     {
//       firstName: "Zoe",
//       lastName: "Carter",
//       mobile: "3323456789",
//       gender: 2,
//       address: "2910 Maple St",
//       training: 2,
//       fees: 155,
//     },
//     {
//       firstName: "Anthony",
//       lastName: "Mitchell",
//       mobile: "3423456789",
//       gender: 1,
//       address: "3010 Birch St",
//       training: 1,
//       fees: 135,
//     },
//     {
//       firstName: "Grace",
//       lastName: "Perez",
//       mobile: "3523456789",
//       gender: 2,
//       address: "3110 Cedar St",
//       training: 2,
//       fees: 140,
//     },
//     {
//       firstName: "Alexander",
//       lastName: "Turner",
//       mobile: "3623456789",
//       gender: 1,
//       address: "3210 Willow St",
//       training: 1,
//       fees: 150,
//     },
//     {
//       firstName: "Chloe",
//       lastName: "Phillips",
//       mobile: "3723456789",
//       gender: 2,
//       address: "3310 Chestnut St",
//       training: 2,
//       fees: 160,
//     },
//   ];

//   const today = new Date(); // Get the current date
//   const futureDate = new Date(today); // Copy the current date
//   futureDate.setDate(today.getDate() + 30);

//   const formattedDate = convertToDateFormat(futureDate);

//   for (let i = 0; i < dummyMembers.length; i++) {
//      await Member.create({
//       firstName:dummyMembers[i].firstName,
//       lastName:dummyMembers[i].lastName,
//       mobile:dummyMembers[i].mobile,
//       gender:dummyMembers[i].gender,
//       address:dummyMembers[i].address,
//       training:dummyMembers[i].training,
//       fees:dummyMembers[i].fees,
//       dueDate: formattedDate,
//       startMonthDate: convertToDateFormat(today),
//       picture: "",
//     });
//   }
//   res.status(200).json({msg:"succesfully members added"})
// });

main().catch((err) => console.log(err));

async function main() {
  mongoose
    .connect(process.env.MONGO_DB_URL, { useNewUrlParser: true })
    .then(() => {
      console.log("mongo_db connected");
    });
}

const htttpServer = http.createServer(app);
htttpServer.listen(port, () => {
  console.log("Server is running on port 4000");
});
