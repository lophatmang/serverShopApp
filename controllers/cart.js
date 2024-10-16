const Cart = require("../models/cart");
const Product = require("../models/product");

exports.postCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const productId = req.body.productId;
    const amount = req.body.amount;
    const product = await Product.findById(productId);
    if (!product)
      return res.status(400).json({ errorMessage: "Sản phẩm không tồn tại" });

    const cart = await Cart.findOne({ userId: userId });
    if (cart) {
      const indexProduct = cart.product.findIndex(
        (product) => product.productId.toString() == productId.toString()
      );
      if (indexProduct !== -1) {
        if (cart.product[indexProduct].quantity + amount > product.inventory)
          return res
            .status(400)
            .json({ errorMessage: "Số lượng tồn kho ko đủ" });

        cart.product[indexProduct].quantity += Number(amount);
      } else {
        cart.product.push({ productId, quantity: amount });
      }
      cart.totalPrice += product.price * amount;
      cart.save();
    } else {
      const newCart = new Cart({
        userId,
        product: [{ productId, quantity: amount }],
        totalPrice: product.price * amount,
      });
      newCart.save();
    }
    res.status(200).json({ message: "Đã thêm sản phẩm vào giỏ hàng" });
  } catch (error) {
    return next(new Error(error));
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ userId: userId }).populate(
      "product.productId"
    );
    if (!cart)
      return res
        .status(400)
        .json({ errorMessage: "Bạn chưa thêm sản phẩm vào giỏ hàng" });
    return res.status(200).json(cart);
  } catch (error) {
    return next(new Error(error));
  }
};

exports.postDeleteCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const productId = req.body.productId;
    const cart = await Cart.findOne({ userId: userId }).populate(
      "product.productId"
    );
    const productDelete = cart.product.find(
      (product) => product.productId._id.toString() == productId.toString()
    );
    const updateCart = cart.product.filter(
      (product) => product.productId._id.toString() !== productId.toString()
    );
    cart.product = updateCart;
    cart.totalPrice -= productDelete.productId.price * productDelete.quantity;
    cart.save();

    return res.status(200).json({ message: "Đã xóa sản phẩm" });
  } catch (error) {
    return next(new Error(error));
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ userId: userId }).populate(
      "userId product.productId"
    );
    if (!cart)
      return res
        .status(400)
        .json({ errorMessage: "Bạn chưa thêm sản phẩm vào giỏ hàng" });
    return res.status(200).json(cart);
  } catch (error) {
    return next(new Error(error));
  }
};
