const express = require("express");

const router = express.Router();
const productController = require("../controllers/product");

router.get("/products", productController.getProducts);
router.get("/product/:productId", productController.getProductDetail);

module.exports = router;
