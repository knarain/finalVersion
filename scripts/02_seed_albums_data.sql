-- Seed albums data
-- Insert sample albums with their authentication details

-- Insert albums
INSERT INTO albums (client_names, event_type, event_date, category, cover_image, is_locked) VALUES
('SUSHANTH & JOSHNIKA', 'Wedding', '2025-06-15', 'wedding', '/wedding-couple-romantic-portrait.png', TRUE),
('MANI & HARSHITHA', 'Wedding', '2025-05-20', 'wedding', '/bride-portrait-natural-light.png', TRUE),
('AADARSH''S HOUSE WARMING', 'House Warming', '2025-08-07', 'house warming', '/family-portrait-outdoor-session.png', TRUE),
('PRIYA & RAJESH', 'Engagement', '2025-07-15', 'engagement', '/wedding-ceremony-candid-moment.png', FALSE),
('KAVYA''S BIRTHDAY', 'Birthday Celebration', '2025-06-22', 'birthday', '/mountain-landscape-golden-hour.png', TRUE),
('ARJUN & MEERA', '10th Anniversary', '2025-05-10', '10th anniversary', '/wedding-reception-dance-floor.png', FALSE),
('RAVI''S PHOTOSHOOT', 'Professional Photoshoot', '2025-04-03', 'photoshoot', '/coastal-cliffs-ocean-view.png', FALSE),
('LAKSHMI''S CRADLE CEREMONY', 'Cradle Ceremony', '2025-03-18', 'cradle ceremony', '/desert-valley-scenic-view.png', TRUE),
('VIKRAM''S DOTHI CEREMONY', 'Dothi Ceremony', '2025-02-25', 'dothi ceremony', '/forest-path-misty-morning.png', TRUE),
('SAMPLE WEDDING GALLERY', 'Wedding Showcase', NULL, 'wedding', '/wedding-couple-romantic-portrait.png', FALSE),
('PORTRAIT SHOWCASE', 'Portrait Session', NULL, 'photoshoot', '/bride-portrait-natural-light.png', FALSE),
('FAMILY MOMENTS', 'Family Photography', NULL, 'photoshoot', '/family-portrait-outdoor-session.png', FALSE);
