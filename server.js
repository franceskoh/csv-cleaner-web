const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { parse } = require('csv-parse/sync');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.get('/', (req, res) => {
    res.json({ message: 'CSV Cleaner API is running' });
});

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const csvContent = req.file.buffer.toString('utf8');
        const records = parse(csvContent, { columns: true, skip_empty_lines: true });
        
        const cleaned = [];
        const seenEmails = new Set();
        const stats = { totalRows: 0, duplicatesRemoved: 0, validEmails: 0, invalidWebsites: 0 };
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

        for (const row of records) {
            stats.totalRows++;
            const email = (row.email || '').trim().toLowerCase();
            if (!email) continue;

            if (seenEmails.has(email)) {
                stats.duplicatesRemoved++;
                continue;
            }
            seenEmails.add(email);

            if (emailRegex.test(email)) {
                stats.validEmails++;
                row.email = email;
            } else {
                row.email = `${email} [INVALID]`;
            }

            const website = (row.website || '').trim();
            if (website) {
                if (!website.toLowerCase().startsWith('http')) {
                    row.website = `https://${website}`;
                }
            } else {
                stats.invalidWebsites++;
            }

            row.ai_summary = `Enriched: ${row.company || 'Unknown'} specializes in ${row.industry || 'Unknown'}.`;
            cleaned.push(row);
        }

        res.json({
            message: 'File processed successfully',
            filename: req.file.originalname,
            stats,
            cleanedRows: cleaned
        });

    } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({ error: 'Failed to process CSV' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});