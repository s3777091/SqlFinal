DROP PROCEDURE IF EXISTS addProductToCart;

DELIMITER //

CREATE PROCEDURE addProductToCart(
    IN userIN INT,
    IN productIn INT,
    IN quantityIN INT,
    IN ProductOption VARCHAR(1024)
)
BEGIN
    DECLARE userCheck INT;
    DECLARE productCheck INT;
    DECLARE cart_id INT;
    DECLARE productWarehouseId INT;
    DECLARE existing_quantity INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            ROLLBACK;
            RESIGNAL;
        END;

    START TRANSACTION;

    SELECT id INTO userCheck FROM users WHERE id = userIN;

    -- Check if the user exists
    IF userCheck IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Need Login to add Cart!';
    END IF;

    -- Check if the product exists
    SELECT id, warehouseId INTO productCheck, productWarehouseId FROM products WHERE id = productIn;

    IF productCheck IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Something went wrong with the product. Please try again.';
    END IF;

    -- Find or create a new cart
    SELECT id INTO cart_id FROM carts WHERE userId = userIN AND status = 'on-going';

    IF cart_id IS NULL THEN
        SET @warehouseDetails = (SELECT CONCAT_WS(', ', city, province, district, street) FROM warehouses WHERE id = productWarehouseId);
        INSERT INTO carts (userId, deliveryFrom, status) VALUES (userIN, @warehouseDetails, 'on-going');
        SET cart_id = LAST_INSERT_ID();
    END IF;

    SELECT quality INTO existing_quantity FROM qualities WHERE productID = productIn AND cartId = cart_id FOR UPDATE;

    IF existing_quantity IS NOT NULL THEN
        UPDATE qualities SET quality = quality + quantityIN WHERE productID = productIn AND cartId = cart_id;
    ELSE
        INSERT INTO qualities (productID, product_name, product_image, product_cost, quality, cartId)
        SELECT id, prname, image, cost, quantityIN, cart_id
        FROM products
        WHERE id = productIn;

        UPDATE qualities SET product_option = ProductOption WHERE productID = productIn AND cartId = cart_id;
    END IF;

    COMMIT;
END //

DELIMITER ;


DROP PROCEDURE IF EXISTS PerformPayment;

DELIMITER //

CREATE PROCEDURE PerformPayment(
    IN locationChangeIN VARCHAR(1024),
    IN acceptIn INT,
    IN userIdIn INT
)
BEGIN
    DECLARE productID INT;
    DECLARE totalBill DECIMAL(10, 2);
    DECLARE cartId INT;
    DECLARE qualityValue INT;

    -- Declare handlers for rollback
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            ROLLBACK;
            RESIGNAL;
        END;

    -- Start a transaction
    START TRANSACTION;

    -- Get the user's cart
    SELECT id INTO cartId FROM carts WHERE userId = userIdIn AND status = 'on-going';

    -- If no cart is found, raise an exception
    IF cartId IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cart not found';
    END IF;

    -- Update the cart status and deliveryTo
    UPDATE carts SET status = 'success', deliveryTo = IFNULL(locationChangeIN, deliveryTo) WHERE id = cartId;

    SELECT SUM(product_cost * quality) INTO totalBill
    FROM qualities WHERE cartId = cartId AND status = 'on-going';

    -- Check if the user has sufficient funds
    SELECT amount INTO @userAmount FROM users WHERE id = userIdIn FOR UPDATE;
    IF @userAmount < totalBill THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient funds for payment';
    END IF;

    -- Deduct the payment amount from the user's balance
    UPDATE users SET amount = amount - totalBill WHERE id = userIdIn;

    -- Update quality statuses
    UPDATE qualities SET status = 'success' WHERE cartId = cartId AND status = 'on-going';

    COMMIT;
END //

DELIMITER ;


DELIMITER //
DROP TRIGGER IF EXISTS check_update_quality;
CREATE TRIGGER check_update_quality
    BEFORE UPDATE ON qualities
    FOR EACH ROW
BEGIN
    IF NEW.status = 'success' THEN
        UPDATE products SET amount = amount - NEW.quality WHERE id = NEW.productID;
    END IF;
END //
DELIMITER ;

DELIMITER //

DROP TRIGGER IF EXISTS check_update_product;
CREATE TRIGGER check_update_product
    BEFORE UPDATE ON products
    FOR EACH ROW
BEGIN
    IF (NEW.amount - OLD.amount) < 0 THEN
        UPDATE warehouses SET available = available - (NEW.space * (OLD.amount - NEW.amount)) WHERE id = NEW.warehouseId;
    ELSEIF (NEW.amount - OLD.amount) > 0 THEN
        UPDATE warehouses SET available = available + (NEW.space * (NEW.amount - OLD.amount)) WHERE id = NEW.warehouseId;
    END IF;
END //

DELIMITER ;


DELIMITER //

DROP TRIGGER IF EXISTS check_space_before_insert;
CREATE TRIGGER check_space_before_insert
    BEFORE UPDATE ON warehouses
    FOR EACH ROW
BEGIN
    IF NEW.available <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Not enough space in any warehouse';
    END IF;
END //

DELIMITER ;

COMMIT;

ALTER TABLE products ADD FULLTEXT(prName);


SHOW TRIGGERS ;