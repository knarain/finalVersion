-- Seed album images
-- Insert sample images for each album

-- SUSHANTH & JOSHNIKA Wedding (Album ID: 1)
INSERT INTO album_images (album_id, image_url, image_title, sort_order) VALUES
(1, '/wedding-couple-romantic-portrait.png', 'Romantic Portrait', 1),
(1, '/bride-portrait-natural-light.png', 'Bride Portrait', 2),
(1, '/wedding-ceremony-candid-moment.png', 'Ceremony Moment', 3),
(1, '/wedding-reception-dance-floor.png', 'Reception Dance', 4);

-- MANI & HARSHITHA Wedding (Album ID: 2)
INSERT INTO album_images (album_id, image_url, image_title, sort_order) VALUES
(2, '/bride-portrait-natural-light.png', 'Bridal Portrait', 1),
(2, '/wedding-couple-romantic-portrait.png', 'Couple Portrait', 2),
(2, '/wedding-ceremony-candid-moment.png', 'Wedding Ceremony', 3);

-- AADARSH'S HOUSE WARMING (Album ID: 3)
INSERT INTO album_images (album_id, image_url, image_title, sort_order) VALUES
(3, '/family-portrait-outdoor-session.png', 'Family Portrait', 1),
(3, '/mountain-landscape-golden-hour.png', 'House Exterior', 2);

-- PRIYA & RAJESH Engagement (Album ID: 4) - Public
INSERT INTO album_images (album_id, image_url, image_title, sort_order) VALUES
(4, '/wedding-ceremony-candid-moment.png', 'Engagement Ceremony', 1),
(4, '/wedding-couple-romantic-portrait.png', 'Couple Portrait', 2);

-- KAVYA'S BIRTHDAY (Album ID: 5)
INSERT INTO album_images (album_id, image_url, image_title, sort_order) VALUES
(5, '/mountain-landscape-golden-hour.png', 'Birthday Celebration', 1),
(5, '/family-portrait-outdoor-session.png', 'Family Moments', 2);

-- ARJUN & MEERA Anniversary (Album ID: 6) - Public
INSERT INTO album_images (album_id, image_url, image_title, sort_order) VALUES
(6, '/wedding-reception-dance-floor.png', 'Anniversary Dance', 1),
(6, '/wedding-couple-romantic-portrait.png', 'Anniversary Portrait', 2);

-- RAVI'S PHOTOSHOOT (Album ID: 7) - Public
INSERT INTO album_images (album_id, image_url, image_title, sort_order) VALUES
(7, '/coastal-cliffs-ocean-view.png', 'Coastal Portrait', 1),
(7, '/mountain-landscape-golden-hour.png', 'Golden Hour Shot', 2);

-- LAKSHMI'S CRADLE CEREMONY (Album ID: 8)
INSERT INTO album_images (album_id, image_url, image_title, sort_order) VALUES
(8, '/desert-valley-scenic-view.png', 'Cradle Ceremony', 1),
(8, '/family-portrait-outdoor-session.png', 'Family Blessing', 2);

-- VIKRAM'S DOTHI CEREMONY (Album ID: 9)
INSERT INTO album_images (album_id, image_url, image_title, sort_order) VALUES
(9, '/forest-path-misty-morning.png', 'Dothi Ceremony', 1),
(9, '/family-portrait-outdoor-session.png', 'Traditional Moment', 2);

-- Public Showcase Albums
INSERT INTO album_images (album_id, image_url, image_title, sort_order) VALUES
(10, '/wedding-couple-romantic-portrait.png', 'Wedding Sample 1', 1),
(10, '/bride-portrait-natural-light.png', 'Wedding Sample 2', 2),
(10, '/wedding-ceremony-candid-moment.png', 'Wedding Sample 3', 3),

(11, '/bride-portrait-natural-light.png', 'Portrait Sample 1', 1),
(11, '/coastal-cliffs-ocean-view.png', 'Portrait Sample 2', 2),

(12, '/family-portrait-outdoor-session.png', 'Family Sample 1', 1),
(12, '/mountain-landscape-golden-hour.png', 'Family Sample 2', 2);
