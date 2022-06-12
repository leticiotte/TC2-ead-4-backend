const router = require("express").Router();

const Order = require("../models/Order");
const Product = require("../models/Product");
const validator = require("../assets/validators");

router.post("/", async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "Missing body" });
    return;
  }
  const params = ["name", "brand", "size", "price", "url"];
  const { name, brand, size, price, url } = req.body;
  for (const param of params) {
    if (!req.body.hasOwnProperty(param)) {
      res.status(400).json({ error: `missing body attribute ${param}` });
      return;
    }
  }

  const date = new Date();
  const product = {
    name,
    brand,
    size,
    price,
    url,
    creationTimestamp: `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`,
  };
  try {
    await Product.create(product);
    res.status(201).json();
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

router.get("/", async (req, res) => {
  try {
    let products = await Product.find();
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!validator.validateId(id)) {
    res.status(400).json({ displayMessage: `Id do produto inválido` });
    return;
  }
  try {
    const product = await Product.findOne({ _id: id });
    if (!product) {
      res.status(404).json();
      return;
    }
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  if (!validator.validateId(id)) {
    res.status(400).json({ displayMessage: `Id do produto inválido` });
    return;
  }
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "missing body" });
    return;
  }

  const params = ["name", "brand", "size", "price", "url"];
  const { name, brand, size, price, url } = req.body;
  for (const param of params) {
    if (!req.body.hasOwnProperty(param)) {
      res.status(400).json({ error: `missing body attribute ${param}` });
      return;
    }
  }

  const date = new Date();
  const product = {
    name,
    brand,
    size,
    price,
    url,
    updatedTimestamp: `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`,
  };

  try {
    const updtatedProduct = await Product.updateOne(
      { _id: id },
      {
        $set: {
          name: product.name,
          brand: product.brand,
          size: product.size,
          price: product.price,
          url: product.url,
          updatedTimestamp: product.updatedTimestamp,
        },
      }
    );
    if (updtatedProduct.matchedCount === 0) {
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
    res.status(400).json({ displayMessage: `Id do produto inválido` });
    return;
  }
  try {
    const product = await Product.findOne({ _id: id });
    if (!product) {
      res.status(404).json();
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }

  const order = await Order.find({ productId: id });
  if (order) {
    res.status(400).json({
      displayMessage: "Esse produto não pode ser excluído pois já foi comprado",
    });
    return;
  }

  try {
    await Product.deleteOne({ _id: id });
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

module.exports = router;
