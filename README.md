# CSV Lead Cleaner

A full-stack web application that processes CSV lead lists. It removes duplicates, validates email formats, standardizes URLs, and returns a cleaned dataset ready for export.

## Features

- Upload CSV files via file selector
- Remove duplicate entries based on email address
- Validate email formats
- Standardize URLs (automatically prepends https:// when missing)
- Display processing statistics (total rows, duplicates removed, valid emails)
- Download the cleaned results as a new CSV file
- Local data processing (no external API calls or cloud storage)

## Tech Stack

- Frontend: React, Vite
- Backend: Node.js, Express
- File Handling: Multer, csv-parse

## Installation

### Backend
1. Install dependencies: `npm install`
2. Start the server: `node server.js`
3. The API will run on `http://localhost:3000`

### Frontend
1. Navigate to the client directory: `cd client`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. The app will run on `http://localhost:5173`

## API Documentation

### POST /upload
Accepts a multipart form request with a single file field named `file`.

**Response:**
```json
{
  "message": "File processed successfully",
  "filename": "example.csv",
  "stats": {
    "totalRows": 0,
    "duplicatesRemoved": 0,
    "validEmails": 0,
    "invalidWebsites": 0
  },
  "cleanedRows": []
}
