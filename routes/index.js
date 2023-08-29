var express = require('express');
var router = express.Router();


const db = require("../models");

const Product = db.product;
const Category = db.category;
const Admin = db.admin;


const { Op } = require('sequelize');
require("dotenv").config();


exports.viewProductByCategory = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const categoryId = req.query.categoryId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!categoryId) {
      await transaction.rollback();
      return res.status(400).send({ message: "Please provide a valid category ID." });
    }

    const category = await Category.findOne({
      where: {
        id: categoryId,
      },
      attributes: ['id', 'name', 'image', 'slug', 'code', 'link'],
      raw: true,
      transaction
    });

    if (!category) {
      await transaction.rollback();
      return res.status(404).send({ message: "Category not found." });
    }

    const products = await Product.findAll({
      where: {
        categoryId: category.id
      },
      attributes: ['prName', 'prId', 'prLink', 'image', 'cost'],
      raw: true,
      offset: parseInt(offset),
      limit: limit,
      transaction
    });

    const categoryWithProducts = {
      category_info: category,
      products: products
    };

    await transaction.commit(); // Commit the transaction
    return res.status(200).send(categoryWithProducts);
  } catch (error) {
    await transaction.rollback();
    res.status(500).send({ message: error.message });
  }
};


/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'image', 'slug', 'code', 'link'],
      raw: true
    });


    res.render('index', { title: 'Home Page', categories });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
});

router.get('/filter', async (req, res, next) => {

  const transaction = await db.sequelize.transaction();
  try {
    const categoryId = req.query.categoryId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    if (!categoryId) {
      await transaction.rollback();
      return res.status(400).send({ message: "In-valid category ID." });
    }

    const category = await Category.findOne({
      where: {
        id: categoryId,
      },
      attributes: ['id', 'name', 'image', 'slug', 'code', 'link'],
      raw: true,
      transaction
    });

    if (!category) {
      await transaction.rollback();
      return res.status(404).send({ message: "Category not found." });
    }

    const products = await Product.findAll({
      where: {
        categoryId: category.id
      },
      attributes: ['prName', 'prId', 'prLink', 'image', 'cost'],
      raw: true,
      offset: parseInt(offset),
      limit: limit,
      transaction
    });

    const categoryWithProducts = {
      category_info: category,
      products: products
    };

    await transaction.commit();
    return res.status(200).send(categoryWithProducts);
  } catch (error) {
    await transaction.rollback();
    res.status(500).send({ message: error.message });
  }
});




module.exports = router;
