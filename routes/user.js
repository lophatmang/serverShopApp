const express = require("express");
const { check, body } = require("express-validator");
const User = require("../models/user");

const router = express.Router();
const userController = require("../controllers/user");

router.post(
  "/regiseter",
  [
    check("email")
      .isEmail()
      .withMessage("Định dạng email không hợp lệ")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail đã được tạo trước đó");
          }
        });
      }),
    body(
      "password",
      "Mật khẩu dài từ 8 ký tự trở lên và không chứa ký tự đặc biệt."
    )
      .isLength({ min: 8 })
      .isAlphanumeric()
      .trim(),
    body("phone", "Bạn chưa điền số điện thoại").not().isEmpty(),
    body("fullName", "Bạn chưa điền tên").not().isEmpty(),
    body("address", "Bạn chưa điền địa chỉ").not().isEmpty(),
  ],
  userController.postRegiseter
);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Định dạng email không hợp lệ"),
    body(
      "password",
      "Mật khẩu dài từ 8 ký tự trở lên và không chứa ký tự đặc biệt"
    )
      .isLength({ min: 8 })
      .isAlphanumeric()
      .trim(),
  ],
  userController.postLogin
);

module.exports = router;
