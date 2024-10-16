const Session = require("../models/session");

exports.getChat = (req, res, next) => {
  try {
    const role = req.role;
    const userId = req.userId;
    if (role === "customer") {
      Session.findOne({ userId: userId }).then((chatMessage) => {
        if (chatMessage) {
          res.status(200).json(chatMessage);
        } else {
          res.status(200).json({ chatMessage: [] });
        }
      });
    } else {
      Session.find().then((allMessage) => {
        res.status(200).json(allMessage);
      });
    }
  } catch (error) {
    return next(new Error(error));
  }
};
