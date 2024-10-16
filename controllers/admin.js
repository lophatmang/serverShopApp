const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");
const paginate = require("../utils/paging");
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "thanh.kaneki123@gmail.com",
    pass: "zayoahqrpqstqnvs",
  },
});

exports.postLoginAdmin = (req, res, next) => {
  const data = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: data.email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          errorMessage: "Email hoặc Mật khẩu sai",
        });
      }
      if (user.role == "customer") {
        return res.status(400).json({
          errorMessage: "Bạn không có quyền truy cập vào trang này",
        });
      }
      bcrypt
        .compare(data.password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            const token = jwt.sign(
              {
                email: user.email,
                userId: user._id.toString(),
                role: user.role,
              },
              "somesupersecretsecret",
              { expiresIn: "1h" }
            );
            res.status(200).json({
              message: "Đăng nhập thành công",
              userId: user._id,
              fullName: user.fullName,
              role: user.role,
              token: token,
            });
            return transporter.sendMail({
              to: data.email,
              from: "thanh.kaneki123@gmail.com",
              subject: "Cảnh báo đăng nhập",
              html: `<h1>bạn đã đăng nhập vào lúc: ${new Date().toLocaleString()}</h1>`,
            });
          }
          return res.status(400).json({
            errorMessage: "Email hoặc Mật khẩu sai",
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((error) => next(new Error(error)));
};

exports.getUserList = async (req, res, next) => {
  try {
    const role = req.role;
    const page = req.query.page || 1;
    const allUser = await User.find();
    if (role !== "admin") {
      return res.status(400).json({
        errorMessage: "Bạn không có quyền truy cập vào trang này",
      });
    }

    const user = allUser.filter(
      (e) => e.role == "customer" || e.role == "consultant"
    );
    res.status(200).json({
      results: paginate(user, page, 8),
      page: page,
      total_pages: Math.ceil(user.length / 8),
    });
  } catch (error) {
    return next(new Error(error));
  }
};

exports.getOrder = (req, res, next) => {
  const page = req.query.page || 1;
  if (page == "all") {
    return Order.find()
      .populate("product.productId")
      .then((order) => {
        res.status(200).json({
          results: order,
        });
      });
  }
  Order.find()
    .populate("product.productId")
    .then((order) => {
      res.status(200).json({
        results: paginate(order, page, 4),
        page: page,
        total_pages: Math.ceil(order.length / 4),
      });
    });
};

exports.getTransaction = (req, res, next) => {
  Order.find()
    .populate("product.productId")
    .then((order) => {
      res.status(200).json(order);
    });
};
exports.getUser = async (req, res, next) => {
  const allUser = await User.find();

  const user = allUser.filter((e) => e.role == "customer");
  res.status(200).json(user);
};

exports.getProducts = async (req, res, next) => {
  try {
    const role = req.role;
    const page = req.query.page || 1;
    if (role !== "admin") {
      return res.status(400).json({
        errorMessage: "Bạn không có quyền truy cập vào trang này",
      });
    }
    Product.find().then((products) => {
      res.status(200).json({
        results: paginate(products, page, 4),
        page: page,
        total_pages: Math.ceil(products.length / 4),
      });
    });
  } catch (error) {
    return next(new Error(error));
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  try {
    const role = req.role;
    const productId = req.body.productId;
    if (role !== "admin") {
      return res.status(400).json({
        errorMessage: "Bạn không có quyền xóa sản phẩm",
      });
    }

    //xoa cart
    const carts = await Cart.find().populate("product.productId");
    carts.map((cart) => {
      const newCart = cart.product.filter(
        (e) => e.productId._id.toString() !== productId.toString()
      );
      const delelecart = cart.product.find(
        (e) => e.productId._id.toString() == productId.toString()
      );
      cart.product = newCart;
      if (delelecart) {
        cart.totalPrice -= delelecart.productId.price * delelecart.quantity;
      }
      cart.save();
    });

    ///////xoa order
    const orders = await Order.find();
    orders.map((order) => {
      const newOder = order.product.find(
        (e) => e.productId.toString() == productId.toString()
      );
      if (newOder) {
        order.status = "canceled";
        order.save();
      }
    });

    Product.findByIdAndDelete(productId).then(() => {
      res.status(200).json({ message: "Đã xóa sản phẩm" });
    });
  } catch (error) {
    return next(new Error(error));
  }
};

exports.postAddProduct = async (req, res, next) => {
  try {
    const role = req.role;
    const productId = req.body.productId;
    const name = req.body.name;
    const category = req.body.category;
    const price = req.body.price;
    const long_desc = req.body.long_desc;
    const short_desc = req.body.short_desc;
    const image = req.body.image;
    const inventory = req.body.inventory;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    if (role !== "admin") {
      return res.status(400).json({
        errorMessage: "Bạn không có quyền chức năng này",
      });
    }
    if (!productId) {
      const product = new Product({
        name,
        price,
        category,
        long_desc,
        short_desc,
        img1: image[0],
        img2: image[1],
        img3: image[2],
        img4: image[3],
        inventory,
      });
      product
        .save()
        .then(() =>
          res.status(200).json({ message: "Thêm sản phảm thành công" })
        );
    } else {
      Product.findByIdAndUpdate(productId, {
        name,
        price,
        category,
        long_desc,
        short_desc,
        inventory,
      }).then(() => {
        res.status(200).json({ message: "Cập nhật sản phảm thành công" });
      });
    }
  } catch (error) {
    return next(new Error(error));
  }
};

exports.getEditProduct = (req, res, next) => {
  try {
    const productId = req.query.id;
    const role = req.role;
    if (role !== "admin") {
      return res.status(400).json({
        errorMessage: "Bạn không có quyền chức năng này",
      });
    }

    Product.findById(productId).then((product) => {
      res.status(200).json(product);
    });
  } catch (error) {
    return next(new Error(error));
  }
};
