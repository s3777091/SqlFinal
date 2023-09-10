DELIMITER //
CREATE PROCEDURE SelectWarehouseForStocking(IN product_cbm FLOAT, IN required_quantity INT)
BEGIN
    DECLARE selected_warehouse_id INT;

    -- Start transaction
    START TRANSACTION;

    BEGIN
        -- Logic to select a warehouse based on the largest available space
        SELECT id INTO selected_warehouse_id FROM Warehouses 
        WHERE available_cbm >= (product_cbm * required_quantity)
        ORDER BY available_cbm DESC LIMIT 1;

        IF selected_warehouse_id IS NOT NULL THEN
            -- Update the warehouse space
            UPDATE Warehouses SET available_cbm = available_cbm - (product_cbm * required_quantity)
            WHERE id = selected_warehouse_id;
            
            -- Commit the transaction if everything is successful
            COMMIT;
        ELSE
            -- If no warehouse can accommodate the product, rollback
            ROLLBACK;
        END IF;
    END;
    
END;
//
DELIMITER ;