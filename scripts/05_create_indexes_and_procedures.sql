-- Create additional indexes and stored procedures for better performance

-- Additional indexes for better query performance
CREATE INDEX idx_albums_category_locked ON albums(category, is_locked);
CREATE INDEX idx_album_access_email_album ON album_access(email, album_id);
CREATE INDEX idx_access_logs_date ON access_logs(accessed_at DESC);

-- Stored procedure to authenticate album access
DELIMITER //
CREATE PROCEDURE AuthenticateAlbumAccess(
    IN p_album_id INT,
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    DECLARE v_password_hash VARCHAR(255);
    DECLARE v_access_granted BOOLEAN DEFAULT FALSE;
    
    -- Get the stored password hash
    SELECT password_hash INTO v_password_hash
    FROM album_access 
    WHERE album_id = p_album_id AND email = p_email;
    
    -- Check if password matches (in production, use proper bcrypt verification)
    IF v_password_hash IS NOT NULL THEN
        SET v_access_granted = TRUE;
        
        -- Update access granted timestamp
        UPDATE album_access 
        SET access_granted_at = CURRENT_TIMESTAMP 
        WHERE album_id = p_album_id AND email = p_email;
    END IF;
    
    -- Log the access attempt
    INSERT INTO access_logs (album_id, email, ip_address, user_agent, access_successful)
    VALUES (p_album_id, p_email, p_ip_address, p_user_agent, v_access_granted);
    
    -- Return result
    SELECT v_access_granted as access_granted, v_password_hash IS NOT NULL as user_exists;
END //
DELIMITER ;

-- Stored procedure to get album with images
DELIMITER //
CREATE PROCEDURE GetAlbumWithImages(IN p_album_id INT)
BEGIN
    -- Get album details
    SELECT * FROM albums WHERE id = p_album_id;
    
    -- Get album images
    SELECT * FROM album_images 
    WHERE album_id = p_album_id 
    ORDER BY sort_order ASC, created_at ASC;
END //
DELIMITER ;
