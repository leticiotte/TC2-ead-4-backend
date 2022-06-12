const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");

const usersRoutes = require("./routes/usersRoutes");
const productsRoutes = require("./routes/productsRoutes");
const ordersRoutes = require("./routes/ordersRoutes");

const DB_USERNAME = process.env.MONGO_USERNAME;
const DB_PASSWORD = encodeURIComponent(process.env.MONGO_PASSWORD);

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Oi express!" });
});

app.use("/users", usersRoutes);
app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);

mongoose.set("useCreateIndex", true);
mongoose
  .connect(
    `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@leticiagoncalves.kjzrn.mongodb.net/bancoTeste?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("MongoDB conectado");
    app.listen(3000);
  })
  .catch((err) => console.error(err));
