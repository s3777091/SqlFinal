// database
const db = require("./models");

const Category = db.category;
const Role = db.role;
const WareHouse = db.warehouse;

require("dotenv").config();

const { createProduct, addCode } = require('./config/tool');


async function initial() {
    const transaction = await db.sequelize.transaction(); // Start a transaction

    try {
        // Create roles
        await Role.bulkCreate([
            { id: 1, name: "user" },
            { id: 2, name: "admin" },
            { id: 3, name: "seller" }
        ], { transaction });

        // Create categories using bulkCreate
        await Category.bulkCreate([
            {
                image: "https://salt.tikicdn.com/ts/category/55/5b/80/48cbaafe144c25d5065786ecace86d38.png",
                name: "Thời trang nữ",
                slug: "thoi-trang-nu",
                code: "931",
                expectedSpace: (420.4 * 266.2 * 20.8) / 1000000000,
                expectedQuality: 100,
                link: "https://tiki.vn/thoi-trang-nu/c931"
            },
            {
                image: "https://salt.tikicdn.com/ts/category/00/5d/97/384ca1a678c4ee93a0886a204f47645d.png",
                name: "Thời trang nam",
                slug: "thoi-trang-nam",
                code: "915",
                expectedSpace: (420.4 * 266.2 * 20.8) / 1000000000,
                expectedQuality: 100,
                link: "https://tiki.vn/thoi-trang-nam/c915"
            },
            {
                image: "https://salt.tikicdn.com/ts/category/13/64/43/226301adcc7660ffcf44a61bb6df99b7.png",
                name: "Đồ Chơi - Mẹ & Bé",
                slug: "do-choi-me-be",
                code: "2549",
                expectedSpace: (140.4 * 140.2 * 362.8) / 1000000000,
                expectedQuality: 100,
                link: "https://tiki.vn/do-choi-me-be/c2549"
            },
            {
                image: "https://salt.tikicdn.com/ts/category/73/0e/89/d7ca146de7198a6808580239e381a0c8.png",
                name: "Làm Đẹp - Sức Khỏe",
                slug: "lam-dep-suc-khoe",
                code: "1520",
                expectedSpace: (140.4 * 140.2 * 142.8) / 1000000000,
                expectedQuality: 100,
                link: "https://tiki.vn/lam-dep-suc-khoe/c1520"
            },
            {
                image: "https://salt.tikicdn.com/ts/category/ca/53/64/49c6189a0e1c1bf7cb91b01ff6d3fe43.png",
                name: "Phụ kiện thời trang",
                slug: "phu-kien-thoi-trang",
                code: "27498",
                expectedSpace: (740.4 * 740.2 * 242.8) / 1000000000,
                expectedQuality: 100,
                link: "https://tiki.vn/phu-kien-thoi-trang/c27498"
            },
            {
                image: "https://salt.tikicdn.com/ts/category/92/b5/c0/3ffdb7dbfafd5f8330783e1df20747f6.png",
                name: "Laptop - Máy Vi Tính - Linh kiện",
                slug: "laptop-may-vi-tinh-linh-kien",
                code: "1846",
                expectedSpace: (320.4 * 166.2 * 60.8) / 1000000000,
                expectedQuality: 100,
                link: "https://tiki.vn/laptop-may-vi-tinh-linh-kien/c1846"
            },
            {
                image: "https://salt.tikicdn.com/ts/category/54/c0/ff/fe98a4afa2d3e5142dc8096addc4e40b.png",
                name: "Điện Thoại - Máy Tính Bảng",
                slug: "dien-thoai-may-tinh-bang",
                code: "1789",
                expectedSpace: (160.8 * 78.1 * 7.7) / 1000000000,
                expectedQuality: 100,
                link: "https://tiki.vn/dien-thoai-may-tinh-bang/c1789"
            }

        ], { transaction });

        // Create warehouses using bulkCreate
        await WareHouse.bulkCreate([
            {
                city: 'Hồ Chí Minh',
                district: 'Quận 7',
                province: 'Nam Phong',
                street: 'Nguyễn Thị Thập',
                totalArea: 3000,
            },
            {
                city: 'Đà nẵng',
                district: 'Hải Châu',
                province: 'Bình Hiên',
                street: 'Hoàng diệu',
                totalArea: 3000,
            },

        ], { transaction });

        await transaction.commit();


        addCode(process.env.TOKEN);

        const pr1 = ["931", "915", "2549", "1520"];
        pr1.forEach(i => {
            console.log('Ware house 1');
            createProduct(i, "1", 80, 1);
        });

        const pr2 = ["27498", "1846", "1789"];
        pr2.forEach(i => {
            console.log('Ware house 2');
            createProduct(i, "2", 80, 2);
        });

    } catch (error) {
        await transaction.rollback();
        console.log(error.message);
    }
}


db.sequelize.sync({ force: false }).then(async () => {
    console.log('Drop and Re-sync Database with { force: true }');
    await initial();
});

// db.sequelize.sync().then(async () => {
//   const categoriesCount = await db.category.count();
//   const roles = await db.role.count();

//   if (categoriesCount === 0 || roles === 0) {
//       // If there are no categories, run the initial function to populate the database
//       console.log('Running initial()...');
//       await initial(); // Call your initial() function here
//   } else {
//       console.log('Database has already been initialized.');
//   }
// });