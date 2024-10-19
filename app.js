const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.yscz2.mongodb.net/shopApp`;

const userRouter = require("./routes/user");
const productRouter = require("./routes/product");
const cartRouter = require("./routes/cart");
const orderRouter = require("./routes/order");
const adminRouter = require("./routes/admin");
const sessionRouter = require("./routes/session");
const Session = require("./models/session");

app.use(cors(), bodyParser.json({ limit: "50mb" }));

app.use(userRouter);
app.use(productRouter);
app.use(cartRouter);
app.use(orderRouter);
app.use(sessionRouter);
app.use("/admin", adminRouter);

app.use((req, res, next) => {
  res.status(404).json({
    errorMessage: "Route not found",
  });
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ errorMessage: message });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const server = app.listen(process.env.PORT || 5000);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client connected");

      socket.on("sendDataClient", (data) => {
        Session.findOne({ userId: data.userId }).then((session) => {
          if (!session) {
            const sessionNew = new Session({
              userId: data.userId,
              chatMessage: [
                {
                  message: data.message,
                  role: data.role,
                },
              ],
            });
            sessionNew.save().then(() => {
              Session.find()
                .select("userId")
                .then((userList) => {
                  io.emit("newRoom", {
                    userId: data.userId,
                    userList: userList,
                  });
                });
            });
          } else {
            session.chatMessage.push({
              message: data.message,
              role: data.role,
            });
            session.save();
            io.emit("sendDataServer", { data });
          }
        });
      });

      socket.on("exit", (data) => {
        Session.findOneAndDelete({ userId: data.userId }).then(() => {
          console.log("Exit Room Chat");
          Session.find()
            .select("userId")
            .then((userList) => {
              io.emit("deleteRoom", {
                userId: data.userId,
                userList: userList,
              });
            });
        });
      });

      socket.on("disconnect", () => {
        console.log(`user is disconnect`);
      });
    });
  })
  .catch((err) => console.log(err));
