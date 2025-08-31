# Photography Portfolio Web App

## Overview
This project is a modern photography portfolio web application built with Next.js, TypeScript, and Tailwind CSS. It features a client gallery system, secure album access, and a mock backend for local development. The backend is designed for MySQL/phpMyAdmin and can be deployed to shared hosting (e.g., Hostinger).

## Features
- Responsive photo gallery and albums
- Album details with image collections
- Secure client access to locked albums (password protected)
- Admin and client authentication (API-ready)
- Mock data for local development (no backend required)
- Type-safe API utilities
- Ready for deployment to shared hosting

## Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Node.js (Express, ES modules), MySQL (phpMyAdmin)
- **Deployment:** Hostinger (FTP, GitHub Actions supported)
- **Local Development:** Mock data via TypeScript modules

## Project Structure
```
finalVersion/
├── lib/
│   ├── api.ts            # API utilities for frontend
│   ├── database.ts       # Mock database for local dev
├── pages/
│   ├── index.tsx         # Home/gallery page
│   ├── album/[id].tsx    # Album details page
│   ├── login.tsx         # Client login page
├── public/
│   ├── images/           # Gallery images
│   ├── screenshots/      # App screenshots & diagrams
├── server.js             # Express backend (for production)
├── sql/
│   ├── schema.sql        # MySQL schema
│   ├── seed.sql          # Sample data
├── .env.local            # Environment variables
├── package.json
├── README.md
```

## Backend Architecture
- **Express.js server** (`server.js`): Handles API requests for albums, images, and authentication.
- **MySQL Database**: Stores albums, images, users, and access control.
- **API Endpoints:**
  - `GET /api/albums` — List all albums
  - `GET /api/albums/:id` — Get album details and images
  - `POST /api/authenticate-album` — Authenticate client access
- **Environment Variables:**
  - `NEXT_PUBLIC_API_BASE_URL` — Controls API endpoint for frontend
- **Deployment:**
  - Upload backend files to Hostinger via FTP
  - Import SQL schema and seed data using phpMyAdmin
  - Configure environment variables for production

## Database Design
### Tables
- **users**: Admin/client accounts
- **albums**: Album metadata (id, client_names, event_type, event_date, category, cover_image, is_locked)
- **album_images**: Images linked to albums
- **album_access**: Access control (email, password_hash, album_id)

### Example Schema
```sql
CREATE TABLE albums (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_names VARCHAR(255),
  event_type VARCHAR(100),
  event_date DATE,
  category VARCHAR(100),
  cover_image VARCHAR(255),
  is_locked BOOLEAN
);

CREATE TABLE album_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  album_id INT,
  image_url VARCHAR(255),
  image_title VARCHAR(255),
  image_description TEXT,
  FOREIGN KEY (album_id) REFERENCES albums(id)
);

CREATE TABLE album_access (
  id INT PRIMARY KEY AUTO_INCREMENT,
  album_id INT,
  email VARCHAR(255),
  password_hash VARCHAR(255),
  FOREIGN KEY (album_id) REFERENCES albums(id)
);
```

## API Design
- **GET /api/albums**: List all albums
- **GET /api/albums/:id**: Get album details and images
- **POST /api/authenticate-album**: Authenticate client access

## Local Development
- Uses mock data in `lib/database.ts` for albums, images, and access
- No backend required; API utilities transform mock data to match TypeScript interfaces
- Switch to production backend by updating `.env.local`

## Deployment
- Deploy backend to Hostinger via FTP or GitHub Actions
- Import SQL schema and seed data using phpMyAdmin
- Set environment variables for API base URL

## Design Layout
### Home/Gallery Page
- Grid of album cards (cover image, client names, event type, date)
- Locked albums show a lock icon
- Click album to view details

### Album Details Page
- Large cover image and album info
- Image gallery (thumbnails, titles, descriptions)
- If locked, prompt for email and password

### Login Page
- Email and password form
- Error/success messages

### Admin Panel (optional)
- Manage albums, images, and access
- Upload new images
- Set album lock/password

## Screenshots & Diagrams
Add your screenshots and diagrams to `public/screenshots/` and reference them below:

### Home/Gallery Page
![Gallery Page](public/screenshots/gallery-screenshot.png)

### Album Details Page
![Album Details](public/screenshots/album-details-screenshot.png)

### Architecture Diagram
![Architecture](public/screenshots/architecture-diagram.png)

## How to Run Locally
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Access at `http://localhost:3000`

## How to Deploy
1. Build: `npm run build`
2. Upload files to Hostinger via FTP
3. Import SQL schema/seed in phpMyAdmin
4. Set environment variables

## Customization
- Add new albums/images in `lib/database.ts` for local dev
- Update SQL scripts for new fields
- Style with Tailwind CSS

## License
MIT

---
For more details, see code comments and SQL scripts in the project.