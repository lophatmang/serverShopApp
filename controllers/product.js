const Product = require("../models/product");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    return next(new Error(error));
  }
};
exports.getProductDetail = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const products = await Product.find();

    const product = products.find((e) => e._id == productId);
    const relatedProducts = products.filter(
      (e) => e.category == product.category && e._id !== product._id
    );

    if (!product)
      return res.status(400).json({ ErrorMessage: "Product not fround" });
    return res
      .status(200)
      .json({ product: product, relatedProducts: relatedProducts });
  } catch (error) {
    return next(new Error(error));
  }
};
