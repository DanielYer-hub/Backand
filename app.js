const express = require('express');
const mongoose = require('mongoose');
const { handleError } = require("./utils/handleErrors");
const connectToDB = require("./DB/dbService");
const chalk = require('chalk');
const corsMiddleware = require('./middleware/cors');
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const battleRoutes = require("./routes/battleRoutes");
const battleLogRoutes = require("./routes/battleLogRoutes");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT;

app.use(corsMiddleware);
app.use(express.static("./public"));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/battles", battleRoutes);
app.use("/api/battlelog", battleLogRoutes);

app.use((req, res, next) => {
  console.log(
    chalk.yellow(
      `Request URL: ${req.url} | Method: ${req.method} | Time: ${new Date()}`
    )
  );
  next();
});

app.use((err, req, res, next) => {
  console.log(err);
  return handleError(res, 500, "Internal Server Error");
});

app.listen(PORT, () =>{
    console.log(chalk.green.bold.bgYellow("app is listening to port " + PORT));
    connectToDB()
      .then(() => {
        console.log('Connected to the database successfully');
      })
      .catch((error) => {
        console.error('Database connection failed:', error);
      });
});
