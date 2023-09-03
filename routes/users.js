var express = require('express');
var router = express.Router();


const db = require("../models");
const config = require("../config/auth-config");

const User = db.user;
const Role = db.role;


const Op = db.Sequelize.Op;


const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


router.get('/', function (req, res, next) {
  let errorMessage = '';
  res.render('User/auth', { title: 'Login page', errorMessage });
});


router.get('/sign_out', async function (req, res, next) {
  try {
    req.session = null;
    return res.status(200).json("You've been signed out!");
  } catch (err) {
    this.next(err);
  }
});


router.get('/information', async function (req, res, next) {
  try {
    console.log(req.session);
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json("User not found");
    }
    
    const userRoles = await user.getRoles();

    return res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: userRoles.map(role => role.name)
    });

  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

router.post("/sign_in", async (req, res, next) => {
  let errorMessage = '';

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
      errorMessage = "User not found.";
      return res.status(400).json(errorMessage); // Pass the error message to the template
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );


    if (!passwordIsValid) {
      await transaction.rollback();
      errorMessage = "Invalid password.";
      return res.status(400).json(errorMessage); // Pass the error message to the template
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

    res.status(200).json("Sign in success");

  } catch (error) {
    await transaction.rollback();
    errorMessage = error.message;
    return res.status(400).json(errorMessage);
  }

});

//Sign Up

router.post("/sign_up", async (req, res, next) => {

  let errorMessage = ''; // Define the errorMessage variable

  const transaction = await db.sequelize.transaction();
  try {
    const user1 = await db.user.findOne({
      where: { email: req.body.email },
    })
    if(user1){
      return res.status(400).json("User already exist");
    }
    const user = await db.user.create({
      username: req.body.username,
      email: req.body.email,
      amount: '99999999999', //Test Money
      password: bcrypt.hashSync(req.body.password, 8),
    }, { transaction });

    const rolesToSet = req.body.roles ? req.body.roles : [1];
    const roles = await Role.findAll({
      where: {
        name: {
          [Op.or]: rolesToSet,
        },
      },
      transaction,
    });

    const result = await user.setRoles(roles, { transaction });
    if (result) {
      await transaction.commit();
      // errorMessage = "User not found.";
      return res.json("Sign up success");
    }
    await transaction.rollback();
    return res.status(400).json("Sign up failed, please try again");
  } catch (error) {
    await transaction.rollback();
    errorMessage = error.message;
    return res.json(errorMessage);
  }
});


module.exports = router;
