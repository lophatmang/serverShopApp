const express = require("express");

const router = express.Router();
const cartController = require("../controllers/cart");
const isAuth = require("../utils/is-auth");

router.post("/addCart", isAuth, cartController.postCart);
router.get("/cart", isAuth, cartController.getCart);
router.post("/delelecart", isAuth, cartController.postDeleteCart);
router.get("/order", isAuth, cartController.getOrder);

module.exports = router;
