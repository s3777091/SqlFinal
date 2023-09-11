var express = require('express');
var router = express.Router();


const db = require("../models");
const config = require("../config/auth-config");

const User = db.user;
const Role = db.role;
const Product = db.product;
const Category = db.category;
const WareHouse = db.warehouse;

const Op = db.Sequelize.Op;


const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { textToSlug } = require('../config/tool');



router.get('/', async function (req, res, next) {
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json("User not found");
    }

    const userInfo = {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    }

    res.render('Pages/admin/index', { title: 'Admin page', userInfo });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

router.get('/product', async function (req, res, next) {
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json("User not found");
    }

    const userInfo = {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    }

    res.render('Pages/admin/productAdmin', { title: 'Admin page', userInfo });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
})

router.get('/category', async (req, res, next) => {
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json("User not found");
    }

    const userInfo = {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    }

    res.render('Pages/admin/categoryAdmin', { title: 'Admin page', userInfo });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
})

router.get('/warehouse', async (req, res, next) => {
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json("User not found");
    }

    const userInfo = {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    }

    res.render('Pages/admin/warehouseAdmin', { title: 'Admin page', userInfo });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
})

router.post('/create_product', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction

  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userRole = await user.getRoles();

    if (userRole[0].name !== 'admin') {
      return res.status(401).json({ message: "You are not admin" });
    }

    const [product, created] = await Product.findOrCreate({
      where: {
        prName: req.body.prName,
        cost: req.body.cost,
        categoryId: req.body.categoryId,
      },
      defaults: {
        prId: req.body.prId,
        prLink: req.body.prLink,
        image: req.body.image,
        brand: req.body.brand,
        space: req.body.space,
        amount: req.body.amount,
        categoryId: req.body.categoryId,
        warehouseId: req.body.warehouseId,
      }
    })

    if (!created) {
      return res.status(401).json({ message: "Product already exists" });
    }

    await transaction.commit();
    return res.status(200).json({ message: "Product created successfully" });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: error.message });
  }
})

router.post('/create_category', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userRole = await user.getRoles();

    if (userRole[0].name !== 'admin') {
      return res.status(401).json({ message: "You are not admin" });
    }

    const [category, created] = await Category.findOrCreate({
      where: {
        code: req.body.code,
        name: req.body.name,
      },
      defaults: {
        image: req.body.image,
        slug: textToSlug(req.body.name),
        expectedSpace: (420.4 * 266.2 * 20.8) / 1000000000,
        expectedQuality: 100,
        link: req.body.link,
      }
    })

    if (!created) {
      return res.status(401).json({ message: "Category already exists" });
    }

    await transaction.commit();
    return res.status(200).json({ message: "Category created successfully" });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: error.message });
  }
})

router.post('/create_warehouse', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction

  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const warehouse = await WareHouse.create({
      city: req.body.city,
      district: req.body.district,
      province: req.body.province,
      street: req.body.street,
      totalArea: req.body.totalArea,
    })

    await transaction.commit();
    return res.status(200).json({ message: "Warehouse created successfully" });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: error.message });
  }
})

router.get('/search_product/:prName', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userRole = await user.getRoles();

    if (userRole[0].name !== 'admin') {
      return res.status(401).json({ message: "You are not admin" });
    }

    const products = await Product.findAll({
      where: {
        prName: {
          [Op.like]: `%${req.params.prName}%`
        }
      },
      transaction,
      limit: 3,
    })

    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

router.get('/search_category/:name', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userRole = await user.getRoles();

    if (userRole[0].name !== 'admin') {
      return res.status(401).json({ message: "You are not admin" });
    }

    const categories = await Category.findAll({
      where: {
        name: {
          [Op.like]: `%${req.params.name}%`
        }
      },
      transaction,
      limit: 3,
    })

    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

router.get('/search_warehouse/:city', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);
    const city = req.params.city;

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userRole = await user.getRoles();

    if (userRole[0].name !== 'admin') {
      return res.status(401).json({ message: "You are not admin" });
    }
    
    const warehouses = await WareHouse.findAll({
      where: {
        city: {
          [Op.like]: `%${city}%`
        }
      },
      transaction,
      limit: 3,
    })

    return res.status(200).json({ warehouses });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

router.get('/product/edit', async (req, res, next) => {
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json("User not found");
    }

    const userInfo = {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    }

    const product = await Product.findByPk(req.query.id);

    if (!product) {
      return res.status(401).json({ message: "Product not found" });
    }

    return res.render('Pages/admin/manageProduct', { title: 'Admin page', product, userInfo });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

router.get('/category/edit', async (req, res, next) => {
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json("User not found");
    }

    const userInfo = {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    }

    const category = await Category.findByPk(req.query.id);

    if (!category) {
      return res.status(401).json({ message: "Category not found" });
    }

    return res.render('Pages/admin/manageCategory', { title: 'Admin page', category, userInfo });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

router.get('/warehouse/edit', async (req, res, next) => {
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json("User not found");
    }

    const userInfo = {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    }

    const warehouse = await WareHouse.findByPk(req.query.id);

    if (!warehouse) {
      return res.status(401).json({ message: "Warehouse not found" });
    }

    return res.render('Pages/admin/manageWarehouse', { title: 'Admin page', warehouse, userInfo });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

router.patch('/update_product', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userRole = await user.getRoles();

    if (userRole[0].name !== 'admin') {
      return res.status(401).json({ message: "You are not admin" });
    }

    await Product.update({
      prName: req.body.prName,
      prLink: req.body.prLink,
      image: req.body.image,
      brand: req.body.brand,
      space: req.body.space,
      amount: req.body.amount,
    }, {
      where: {
        id: req.body.id,
      }
    })

    await transaction.commit();
    return res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

router.patch('/update_category', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userRole = await user.getRoles();

    if (userRole[0].name !== 'admin') {
      return res.status(401).json({ message: "You are not admin" });
    }

    const product = await Product.findOne({
      where: {
        categoryId: req.body.id,
      }
    })

    if (product) {
      return res.status(401).json({ message: "Category is in use" });
    }

    await Category.update({
      name: req.body.name,
      image: req.body.image,
      slug: textToSlug(req.body.name),
      link: req.body.link,
      expectedSpace: req.body.expectedSpace,
      expectedQuality: req.body.expectedQuality,
    }, {
      where: {
        id: req.body.id,
      }
    })

    await transaction.commit();
    return res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

router.patch('/update_warehouse', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const product = await Product.findOne({
      where: {
        warehouseId: req.body.id,
      }
    })

    if (product) {
      return res.status(401).json({ message: "Warehouse is in use. Delete all products before making any changes." });
    }

    await WareHouse.update({
      city: req.body.city,
      district: req.body.district,
      province: req.body.province,
      street: req.body.street,
      totalArea: req.body.totalArea,
    }, {
      where: {
        id: req.body.id,
      }
    })

    await transaction.commit();
    return res.status(200).json({ message: "Warehouse updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

router.delete('/delete_product/:productId', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userRole = await user.getRoles();

    if (userRole[0].name !== 'admin') {
      return res.status(401).json({ message: "You are not admin" });
    }

    const product = await Product.findByPk(req.params.productId);

    if (!product) {
      return res.status(401).json({ message: "Product not found" });
    }

    await product.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

router.delete('/delete_category/:categoryId', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userRole = await user.getRoles();

    if (userRole[0].name !== 'admin') {
      return res.status(401).json({ message: "You are not admin" });
    }

    const category = await Category.findByPk(req.params.categoryId);

    if (!category) {
      return res.status(401).json({ message: "Category not found" });
    }

    const product = await Product.findOne({
      where: {
        categoryId: req.params.categoryId,
      }
    })

    if (product) {
      return res.status(401).json({ message: "Category is in use. Delete all products before making any changes." });
    }

    await category.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

router.delete('/category/delete_all_products/:categoryId', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction
  try {
    const category = await Category.findByPk(req.params.categoryId);

    if (!category) {
      return res.status(401).json({ message: "Category not found" });
    }

    const products = await Product.findAll({
      where: {
        categoryId: req.params.categoryId,
      }
    })

    if (!products) {
      return res.status(401).json({ message: "Category is empty." });
    }

    await Product.destroy({
      where: {
        categoryId: req.params.categoryId,
      }
    })

    await transaction.commit();
    return res.status(200).json({ message: "Products deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

router.delete('/delete_warehouse/:warehouseId', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction
  try {
    const decoded = jwt.verify(req.session.token, config.secret);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const warehouse = await WareHouse.findByPk(req.params.warehouseId);

    if (!warehouse) {
      return res.status(401).json({ message: "Warehouse not found" });
    }

    const product = await Product.findOne({
      where: {
        warehouseId: req.params.warehouseId,
      }
    })

    if (product) {
      return res.status(401).json({ message: "Warehouse is in use. Delete all products before making any changes." });
    }

    await warehouse.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({ message: "Warehouse deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

router.delete('/warehouse/delete_all_products/:warehouseId', async (req, res, next) => {
  const transaction = await db.sequelize.transaction(); // Start a transaction
  try {
    const warehouse = await WareHouse.findByPk(req.params.warehouseId);

    if (!warehouse) {
      return res.status(401).json({ message: "Warehouse not found" });
    }

    const products = await Product.findAll({
      where: {
        warehouseId: req.params.warehouseId,
      }
    })

    if (!products) {
      return res.status(401).json({ message: "Warehouse is empty" });
    }

    await Product.destroy({
      where: {
        warehouseId: req.params.warehouseId,
      }
    })

    await transaction.commit();
    return res.status(200).json({ message: "Products deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

module.exports = router;
