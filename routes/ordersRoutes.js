const router = require("express").Router();

const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const validator = require("../assets/validators");

router.post("/", async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "Missing body" });
    return;
  }
  const params = ["productId", "userId", "quantity", "zipCode", "streetNumber"];
  const { productId, userId, quantity, zipCode, streetNumber, complement } =
    req.body;
  for (const param of params) {
    if (!req.body.hasOwnProperty(param)) {
      res.status(400).json({ error: `missing body attribute ${param}` });
      return;
    }
  }

  const product = await Product.findOne({ _id: productId }).select("price");
  if (!product) {
    res.status(404).json({ displayMessage: "Produto não encontrado" });
    return;
  }

  const user = await User.findOne({ _id: userId }).select("-password");
  if (!user) {
    res.status(404).json({ displayMessage: "Usuário não encontrado" });
    return;
  }

  const order = {
    productId,
    userId,
    quantity,
    zipCode,
    streetNumber,
    creationTimestamp: `${new Date().toLocaleDateString(
      "pt-br"
    )}, ${new Date().toLocaleTimeString("pt-br")}`,
    totalValue: product.price * quantity,
    complement,
  };
  try {
    await Order.create(order);
    res.status(201).json();
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

router.get("/", async (req, res) => {
  try {
    let orders = await Order.find();
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!validator.validateId(id)) {
    res.status(400).json({ displayMessage: `Id da compra inválido` });
    return;
  }
  try {
    const order = await Order.findOne({ _id: id });
    if (!order) {
      res.status(404).json();
      return;
    }
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  if (!validator.validateId(id)) {
    res.status(400).json({ displayMessage: `Id da compra inválido` });
    return;
  }

  const params = ["productId", "userId", "quantity", "zipCode", "streetNumber"];
  const { productId, userId, quantity, zipCode, streetNumber, complement } =
    req.body;
  for (const param of params) {
    if (!req.body.hasOwnProperty(param)) {
      res.status(400).json({ error: `missing body attribute ${param}` });
      return;
    }
  }

  if (!validator.validateId(productId)) {
    res.status(400).json({ displayMessage: `Id do produto inválido` });
    return;
  }
  const product = await Product.findOne({ _id: productId }).select("price");
  if (!product) {
    res.status(404).json({ displayMessage: "Produto não encontrado" });
    return;
  }

  if (!validator.validateId(userId)) {
    res.status(400).json({ displayMessage: `Id do usuário inválido` });
    return;
  }
  const user = await User.findOne({ _id: userId }).select("-password");
  if (!user) {
    res.status(404).json({ displayMessage: "Usuário não encontrado" });
    return;
  }

  const order = {
    productId,
    userId,
    quantity,
    zipCode,
    streetNumber,
    totalValue: product.price * quantity,
    complement,
    updatedTimestamp: `${new Date().toLocaleDateString(
      "pt-br"
    )}, ${new Date().toLocaleTimeString("pt-br")}`,
  };

  try {
    const updtatedOrder = await Order.updateOne(
      { _id: id },
      {
        $set: {
          productId: order.productId,
          userId: order.userId,
          quantity: order.quantity,
          zipCode: order.zipCode,
          streetNumber: order.streetNumber,
          totalValue: order.totalValue,
          complement: order.complement,
          updatedTimestamp: order.updatedTimestamp,
        },
      }
    );
    if (updtatedOrder.matchedCount === 0) {
      res.status(404).json();
      return;
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  if (!validator.validateId(id)) {
    res.status(400).json({ displayMessage: `Id da compra inválido` });
    return;
  }
  try {
    const order = await Order.findOne({ _id: id });
    if (!order) {
      res.status(404).json();
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }

  try {
    await Order.deleteOne({ _id: id });

    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

module.exports = router;
