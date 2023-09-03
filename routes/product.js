var express = require('express');
var router = express.Router();

require("dotenv").config();

const { extractSpid } = require('../config/tool');
const db = require("../models");

const Product = db.product;


/* GET Product page. */
router.get('/detail', async (req, res, next) => {
    try {
        const productCode = req.query.prId;
        const product = await Product.findOne({
            where: {
                prId: productCode,
            },
        });

        if (!product) {
            return res.status(404).send({ message: "Product not found." });
        }

        const spidValue = extractSpid(product.prLink);


        // Fetch product details
        const productResponse = await fetch(
            `${process.env.TIKI_DETAIL}/${product.prId}?platform=web&spid=${spidValue}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
                },
            }
        );

        const productData = await productResponse.json();
        const productInfo = {
            id: product.id,
            name: productData.name,
            image: productData.thumbnail_url,
            brand: productData.brand.name,
            listImage: productData.images,
            price: productData.price,
            specifications: productData.specifications,
            options: productData.configurable_options,
            description: productData.description,
            short_description: productData.short_description,
        };

        // Fetch product comments
        const commentResponse = await fetch(
            `${process.env.TIKI_COMMENT}?limit=7&include=comments,contribute_info,attribute_vote_summary&sort=score%7Cdesc,id%7Cdesc,stars%7Call&page=1&spid=${spidValue}&product_id=${productCode}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
                },
            }
        );

        const commentData = await commentResponse.json();
        const comments = commentData.data.map(ne => ({
            title: ne.title,
            content: ne.content,
            images: ne.images,
            rating: ne.rating,
            created_by_name: ne.created_by.name,
            created_by_image: ne.created_by.avatar_url
        }));

        productInfo.comment_detail = comments;

        // Render the product view with the combined product information
        res.render('product', { productInfo });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});




module.exports = router;
