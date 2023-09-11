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
  res.render('Pages/seller/index', { title: 'Admin page', errorMessage });
});

module.exports = router;
