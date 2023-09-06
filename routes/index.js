var express = require('express');
var router = express.Router();


const db = require("../models");

const Product = db.product;
const Category = db.category;

const Op = db.Sequelize.Op;


require("dotenv").config();

/* GET home page. */
router.get('/', async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {

    const categories = await Category.findAll({
      attributes: ['id', 'name', 'image', 'slug', 'code', 'link'],
      raw: true,
      transaction
    });

    await transaction.commit(); // Commit the transaction

    res.render('index', { title: 'Home Page', categories });
  } catch (error) {
    await transaction.rollback(); // Rollback the transaction on error
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
      attributes: ['id', 'prName', 'prId', 'prLink', 'image', 'cost'],
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

router.post("/search", async (req, res, next) => {
  try {
    const searchTerm = req.body.search;
    const page = req.query.page || 1;
    const pageSize = 10;

    const products = await Product.findAndCountAll({
      where: {
        [Op.or]: [
          { prName: { [Op.like]: `%${searchTerm}%` } },
        ],
      },
      // Implement pagination using offset and limit
      offset: (page - 1) * pageSize,
      limit: pageSize,
      // Enable Full-Text Search
      attributes: {
        include: [
          [db.sequelize.literal(`MATCH(prName) AGAINST('${searchTerm}' IN BOOLEAN MODE)`), "score"]
        ]
      },
      // Order by Full-Text Search score
      order: [[db.sequelize.literal("score"), "DESC"]],
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});


router.post("/add_code", async (req, res, next) => {
  try {
    const [cart, created] = await Admin.findOrCreate({
      where: {
        code: req.body.code,
      },
      defaults: {
        link: process.env.VIDEO
      }
    });
    if (!created) {
      return res.status(400).send({ message: "Cart code already exists." });
    }

    return res.status(200).send({ message: "code added successfully.", code: cart.code });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});


module.exports = router;