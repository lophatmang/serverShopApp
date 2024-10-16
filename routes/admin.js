const express = require("express");
const { body } = require("express-validator");
const isAuth = require("../utils/is-auth");

const router = express.Router();
const adminController = require("../controllers/admin");

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
  adminController.postLoginAdmin
);

router.get("/userList", isAuth, adminController.getUserList);
router.get("/transaction", adminController.getTransaction);
router.get("/user", adminController.getUser);
router.get("/product", isAuth, adminController.getProducts);
router.get("/order", isAuth, adminController.getOrder);
router.post("/deleteProduct", isAuth, adminController.postDeleteProduct);
router.get("/editProduct", isAuth, adminController.getEditProduct);
router.post(
  "/addProduct",
  [
    body("name", "Bạn chưa tên sản phảm").not().isEmpty(),
    body("category", "Bạn chưa category").not().isEmpty(),
    body("price", "Bạn chưa giá tiền").not().isEmpty(),
    body("long_desc", "Bạn chưa mổ tả").not().isEmpty(),
    body("short_desc", "Bạn chưa mổ tả").not().isEmpty(),
  ],
  isAuth,
  adminController.postAddProduct
);

module.exports = router;
