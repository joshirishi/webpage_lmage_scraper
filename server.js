const express = require('express');
const scrapeWebsite = require('./nscraper');

const app = express();
const PORT = 3000;

const cors = require('cors');

// Enable CORS for all routes
app.use(cors());

app.use(express.static('public')); // Serve static files from the 'public' directory

app.get('/scrape', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send({ error: 'URL parameter is required.' });
    }

    try {
        const structure = await scrapeWebsite(targetUrl);
        res.send(structure);
    } catch (error) {
        res.status(500).send({ error: 'Failed to scrape the website.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//comment