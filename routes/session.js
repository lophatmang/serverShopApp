const express = require("express");

const router = express.Router();
const sessionController = require("../controllers/session");
const isAuth = require("../utils/is-auth");

router.get("/getChat", isAuth, sessionController.getChat);

module.exports = router;
