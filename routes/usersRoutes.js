const router = require("express").Router();
const Order = require("../models/Order");
const User = require("../models/User");
const validator = require("../assets/validators");

router.post("/", async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "Missing body" });
    return;
  }
  const params = ["name", "email", "cpf", "password"];
  const { name, email, cpf, password } = req.body;
  for (const param of params) {
    if (!req.body.hasOwnProperty(param)) {
      res.status(400).json({ error: `missing body attribute ${param}` });
      return;
    }
  }

  const date = new Date();
  const user = {
    name,
    email,
    cpf,
    password,
    creationTimestamp: `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`,
  };
  try {
    await User.create(user);
    res.status(201).json();
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

router.get("/", async (req, res) => {
  try {
    let users = await User.find().select("-password -_id");

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!validator.validateId(id)) {
    res.status(400).json({ displayMessage: `Id do usuário inválido` });
    return;
  }
  try {
    const user = await User.findOne({ _id: id }).select("-password");
    if (!user) {
      res.status(404).json();
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  if (!validator.validateId(id)) {
    res.status(400).json({ displayMessage: `Id do usuário inválido` });
    return;
  }

  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "missing body" });
    return;
  }

  const params = ["name", "cpf"];
  const { name, cpf } = req.body;
  for (const param of params) {
    if (!req.body.hasOwnProperty(param)) {
      res.status(400).json({ error: `missing body attribute ${param}` });
      return;
    }
  }

  const date = new Date();
  const user = {
    name,
    cpf,
    updatedTimestamp: `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`,
  };

  try {
    const updtatedUser = await User.updateOne(
      { _id: id },
      {
        $set: {
          name: user.name,
          cpf: user.cpf,
          updatedTimestamp: user.updatedTimestamp,
        },
      }
    );
    if (updtatedUser.matchedCount === 0) {
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
    res.status(400).json({ displayMessage: `Id do usuário inválido` });
    return;
  }

  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      res.status(404).json();
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }

  try {
    await User.deleteOne({ _id: id });

    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

router.post("/auth", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email }).select("email password");
    if (!user) {
      res.status(404).json();
      return;
    }
    if (user.email == email && user.password == password) {
      res.status(200).json({ user });
    } else {
      res.status(401).json();
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

router.get("/:id/orders", async (req, res) => {
  const id = req.params.id;
  if (!validator.validateId(id)) {
    res.status(400).json({ displayMessage: `Id do usuário inválido` });
    return;
  }

  const user = await User.findOne({ _id: id }).select("-password");
  if (!user) {
    res.status(404).json();
    return;
  }

  try {
    const pipeline = [
      {
        $match: { userId: id },
      },
      {
        $lookup: {
          from: "products",
          as: "productName",
          let: {
            id: { $toObjectId: "$productId" },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$products",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          productId: 1,
          productName: 1,
          userId: 1,
          quantity: 1,
          zipCode: 1,
          streetNumber: 1,
          creationTimestamp: 1,
          totalValue: 1,
          complement: 1,
          updatedTimestamp: 1,
          totalValue: 1,
        },
      },
    ];

    let orders = await Order.aggregate(pipeline);
    for (let i = 0; i < orders.length; i++) {
      orders[i].productName = orders[i].productName[0].name;
    }

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: error });
  }
  return;
});

module.exports = router;
