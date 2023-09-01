const db = require("../models");

const Product = db.product;
const warehouse = db.warehouse;
const Category = db.category;
const Admin = db.admin;

require("dotenv").config();

function extractSpid(url) {
    const match = url.match(/spid=(\d+)/);
    if (match && match[1]) {
        return match[1];
    }
    return null;
}


async function addCode(value){
    try {
        const [cart, created] = await Admin.findOrCreate({
            where: {
                code: value,
            },
            defaults: {
                link:  process.env.VIDEO
            }
        });
        if (!created) {
            return 1; //Cart code already exists.
        }

        return 'code added successfully.';
    } catch (error) {
        return error.message;
    }
}

async function createProduct(idCode, page, limit, WH) {
    // const transaction = await db.sequelize.transaction(); // Start a transaction
    try {
        // const idCode = req.body.code;
        // const page = req.body.page;
        // const limit = req.body.limit;
        // const WH = req.body.id;

        const token = await Admin.findOne({
            where: {
                link: process.env.VIDEO
            }
        });

        if (!token) {
            return(1); // Code not found.
        }

        const category = await Category.findOne({
            where: {
                code: idCode,
            }
        });

        if (!category) {
            return(2); // Category not found.
        }

        const response = await fetch(
            `${process.env.TIKI_SLUG}?limit=${limit}&aggregations=2&version=home-persionalized&trackity_id=${token.code}&category=${category.code}&page=${page}&urlKey=${category.slug}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
                },
            }
        );

        const data = await response.json();
        const list = data.data;

        const addedProducts = await Promise.all(list.map(async (ne) => {
            const requireSpace = category.expectedSpace * category.expectedQuality * limit;
            const wareData = await warehouse.findOne({
                where: {
                    id: WH
                }
            })

            if (wareData.available === 0) {
                wareData.available = wareData.totalArea - requireSpace;
                await wareData.save();
            } else {
                wareData.available -= requireSpace;
                await wareData.save();
            }


            const [existingProduct, created] = await Product.findOrCreate({
                where: {
                    prName: ne.name,
                    cost: ne.price,
                    categoryId: category.id
                },
                defaults: {
                    prId: ne.id,
                    prLink: ne.url_path,
                    image: ne.thumbnail_url,
                    rate: ne.rating_average,
                    brand: ne.brand_name,
                    discount: ne.discount,
                    space: category.expectedSpace,
                    amount: category.expectedQuality,
                    categoryId: category.id,
                    warehouseId: WH
                }
            });
            return {
                name: existingProduct.prName,
                cost: existingProduct.cost,
                added: created
            };
        }));

        const addedProductsCount = addedProducts.filter(result => result.added).length;

        return(addedProductsCount > 0
            ? `Added ${addedProductsCount} new products to category ${category.name}`
            : `No new products added to category ${category.name}`);


    } catch (error) {
        return error.message;
    }
};



module.exports = {
    extractSpid,
    createProduct,
    addCode
};