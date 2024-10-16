const express = require("express");

const router = express.Router();
const orderController = require("../controllers/order");
const isAuth = require("../utils/is-auth");

router.post("/addOrder", isAuth, orderController.postOrder);
router.get("/allOrder", isAuth, orderController.getOrder);
router.get("/detailOrder/:orderId", isAuth, orderController.getOrderDetail);

module.exports = router;
