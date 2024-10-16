const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "thanh.kaneki123@gmail.com",
    pass: "zayoahqrpqstqnvs",
  },
});

exports.postRegiseter = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const fullName = req.body.fullName;
  const phone = req.body.phone;
  const address = req.body.address;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email,
        password: hashedPassword,
        fullName,
        phone,
        address,
      });
      return user.save();
    })
    .then(() => {
      res.status(200).json({ message: "Dang ky thanh cong" });
      return transporter.sendMail({
        to: email,
        from: "thanh.kaneki123@gmail.com",
        subject: "tao tai khoan thanh cong",
        html: "<h1>Tao tai khoan thanh cong!!!</h1>",
      });
    })
    .catch((error) => next(new Error(error)));
};

exports.postLogin = async (req, res, next) => {
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
