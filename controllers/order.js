const Order = require("../models/order");
const Cart = require("../models/cart");
const User = require("../models/user");
const Product = require("../models/product");
const nodemailer = require("nodemailer");
const format = require("../utils/format");
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "thanh.kaneki123@gmail.com",
    pass: "zayoahqrpqstqnvs",
  },
});

exports.postOrder = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const fullName = req.body.fullName || user.fullName;
    const email = req.body.email || user.email;
    const phone = req.body.phone || user.phone;
    const address = req.body.address || user.address;
    const cart = await Cart.findOne({ userId: userId }).populate(
      "product.productId"
    );
    if (!cart) return res.status(400).json({ errorMessage: "giỏ hàng rỗng" });

    let errorMessage;
    cart.product.map((product) => {
      if (product.quantity > product.productId.inventory) {
        errorMessage = true;
      }
    });

    if (errorMessage) {
      return Cart.deleteOne({ userId: userId }).then(() => {
        res.status(400).json({ errorMessage: "sản phẩm không đủ hàng đặt" });
      });
    }
    cart.product.map((product) => {
      Product.findById(product.productId._id).then((productUpdate) => {
        productUpdate.inventory -= product.quantity;
        productUpdate.save();
      });
    });
    const order = new Order({
      userId,
      fullName,
      email,
      phone,
      address,
      product: cart.product,
      totalPrice: cart.totalPrice,
    });
    await order.save();

    const table = cart.product.map((e) => {
      const tableHtml = `
      <tr>
        <th style="border: 1px solid black">
          <p>${e.productId.name}</p>
        </th>
        <th style="border: 1px solid black">
          <img
            style="width: 100px"
            src=${e.productId.img1}
            alt=${e.productId.name}
          />
        </th>
        <th style="border: 1px solid black">
          <span>${format(e.productId.price)} VND</span>
        </th>
        <th style="border: 1px solid black">
          <span>${e.quantity}</span>
        </th>
        <th style="border: 1px solid black">
          <span>${format(e.productId.price * e.quantity)} VND</span>
        </th>
      </tr>`;

      return tableHtml;
    });
    const html =
      `
    <div style="background-color: #80808085; display: flex">
      <div style="background-color: white; padding: 40px; margin: 20% auto">
        <h1>Xin chào ${fullName}</h1>
        <p>Phone: ${phone}</p>
        <p>address: ${address}</p>
        <table style="border-collapse: inherit">
          <thead>
            <tr>
              <th style="border: 1px solid black">Tên Sản Phảm</th>
              <th style="border: 1px solid black">Hình Ảnh</th>
              <th style="border: 1px solid black">Giá</th>
              <th style="border: 1px solid black">Số Lượng</th>
              <th style="border: 1px solid black">Thành Tiền</th>
            </tr>
          </thead>
          <tbody>` +
      table.toString().replace(/,/g, " ") +
      `</tbody>
            </table>
            <h1>Tổng Thanh Toán: ${format(cart.totalPrice)} VND</h1>
            <h1>Cảm ơn bạn!</h1>
          </div>
        </div>`;

    Cart.deleteOne({ userId: userId }).then(() => {
      res.status(200).json({ message: "Đã thêm order" });
      transporter.sendMail({
        to: email,
        from: "thanh.kaneki123@gmail.com",
        subject: "Hóa Đơn Mua Hàng Của Bạn",
        html: html,
      });
    });
  } catch (error) {
    return next(new Error(error));
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const userId = req.userId;

    const order = await Order.find({ userId: userId }).populate(
      "product.productId"
    );
    if (!order)
      return res
        .status(400)
        .json({ errorMessage: "Bạn chưa có hóa đơn nào cả" });
    return res.status(200).json(order);
  } catch (error) {
    return next(new Error(error));
  }
};

exports.getOrderDetail = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId).populate("product.productId");
    if (!order)
      return res.status(400).json({ errorMessage: "Đơn hàng không tồn tại" });
    return res.status(200).json(order);
  } catch (error) {
    return next(new Error(error));
  }
};
