var express = require('express');
var router = express.Router();


const db = require("../models");
const config = require("../config/auth-config");

const User = db.user;
const Role = db.role;
const Product = db.product;


const Op = db.Sequelize.Op;


const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.get('/', function (req, res, next) {
  let errorMessage = '';
  res.render('User/auth', { title: 'Login page', errorMessage });
});


router.post("/sign_in", async (req, res, next) => {
  let errorMessage = ''; // Define the errorMessage variable

  const transaction = await db.sequelize.transaction();
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username,
      },
      transaction,
    });


    if (!user) {
      await transaction.rollback();
      const errorMessage = "User not found.";
      return res.render('User/auth', { errorMessage }); // Pass the error message to the template
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );


    if (!passwordIsValid) {
      await transaction.rollback();
      const errorMessage = "Invalid password.";
      return res.render('User/auth', { errorMessage }); // Pass the error message to the template
    }

    const token = jwt.sign({ id: user.id },
      config.secret,
      {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: 86400, // 24 hours
      });

    let authorities = [];
    const roles = await user.getRoles({ transaction });

    for (let i = 0; i < roles.length; i++) {
      authorities.push("ROLE_" + roles[i].name.toUpperCase());
    }

    req.session.token = token;

    await transaction.commit();

    res.redirect("/");
  } catch (error) {
    await transaction.rollback();
    const errorMessage = error.message;
    return res.render('User/auth', { errorMessage });
  }

});



module.exports = router;
