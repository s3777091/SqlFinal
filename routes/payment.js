var express = require('express');
var router = express.Router();

const { authJwt } = require("../Middleware");
const config = require("../config/auth-config");
const jwt = require("jsonwebtoken");

const db = require("../models");

const Cart = db.cart;
const User = db.user;
const Quality = db.quality;

const Sequelize = db.sequelize;

function calculateTotalBill(qualities) {
    return qualities.reduce((totalBill, quality) => {
        return totalBill + quality.product_cost * quality.quality;
    }, 0);
}

router.get('/', async (req, res, next) => {
    res.render('cart/shopcart', { title: 'Cart Page' });
});


router.post("/add", authJwt.verifyToken, async (req, res, next) => {
    const transaction = await Sequelize.transaction();

    const productId = req.body.idProduct;
    const quality = req.body.quality;
    const option = req.body.productOption;

    try {
        const decoded = jwt.verify(req.session.token, config.secret);
        const user = await User.findByPk(decoded.id);

        await Sequelize.query('CALL addProductToCart(?, ?, ?, ?)',
            { replacements: [user.id, productId, quality, option] }
        );

        await transaction.commit();

        res.redirect("/");
    } catch (error) {
        await transaction.rollback();
        return res.status(500).send({ message: error.message });
    }

});


router.post("/update", authJwt.verifyToken, async (req, res, next) => {
    const transaction = await db.sequelize.transaction();

    try {
        const decoded = jwt.verify(req.session.token, config.secret);
        const user = await User.findByPk(decoded.id, { transaction });

        const productId = req.body.productId;
        const newQuantity = req.body.newQuantity;

        const cart = await Cart.findOne({
            where: {
                userId: user.id,
                status: 'on-going',
            },
            transaction,
        });

        if (!cart) {
            await transaction.rollback();
            return res.status(402).send({
                message: "Cart is empty.",
            });
        }

        const quality = await Quality.findOne({
            where: {
                cartId: cart.id,
                productID: productId,
            },
            transaction,
        });

        if (!quality) {
            await transaction.rollback();
            return res.status(404).send({
                message: "Product not found in the cart.",
            });
        }

        // Update the quantity of the quality entry
        quality.quantity = newQuantity;
        await quality.save({ transaction });

        await transaction.commit();

        return res.status(200).send({ message: 'Success update carts' });
    } catch (error) {
        await transaction.rollback();
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});



router.post("/delete", authJwt.verifyToken, async (req, res, next) => {
    const transaction = await db.sequelize.transaction();

    try {
        const decoded = jwt.verify(req.session.token, config.secret);
        const user = await User.findByPk(decoded.id, { transaction });

        const productId = req.body.productId;

        const cart = await Cart.findOne({
            where: {
                userId: user.id,
                status: 'on-going',
            },
            transaction,
        });

        if (!cart) {
            await transaction.rollback();
            return res.status(402).send({
                message: "Cart is empty.",
            });
        }

        const quality = await Quality.findOne({
            where: {
                cartId: cart.id,
                productID: productId,
            },
            transaction,
        });

        if (!quality) {
            await transaction.rollback();
            return res.status(404).send({
                message: "Product not found in the cart.",
            });
        }

        await quality.destroy({ transaction }); // Delete the quality entry

        await transaction.commit();

        return res.status(200).send({ message: 'Success delete carts' });
    } catch (error) {
        await transaction.rollback();
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

router.get('/data', async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {

        const decoded = jwt.verify(req.session.token, config.secret);
        const user = await User.findByPk(decoded.id, { transaction });

        const cart = await Cart.findOne({
            where: {
                userId: user.id,
                status: 'on-going',
            },
            transaction,
        });

        if (cart) {

            const qualities = await Quality.findAll({
                where: {
                    cartId: cart.id,
                },
                transaction,
            });

            const totalBill = calculateTotalBill(qualities);

            await transaction.commit();

            const results = {
                cart: {
                    id: cart.id,
                    deliveryFrom: cart.deliveryFrom,
                    deliveryTo: cart.deliveryTo,
                    status: cart.status
                },
                products: qualities,
                totalBill: totalBill,
            }

            return res.status(200).send(results);

        }

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
});

module.exports = router;
