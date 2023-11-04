const puppeteer = require('puppeteer');
const fs = require('fs');

let visitedUrls = new Set();

async function scrapeWebsite(url, triggeringComponent = 'root') {
    let browser;

    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Block unnecessary resources
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        if (visitedUrls.has(url)) {
            return;
        }
        visitedUrls.add(url);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // Increased timeout

        // Create folder if it doesn't exist
        const folderName = 'pages_' + new URL(url).hostname.replace(/\./g, '_');
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName);
        }

        // Capture screenshot
        const screenshotPath = `${folderName}/${triggeringComponent}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });

        console.log(`Screenshot saved for ${url} triggered by ${triggeringComponent}`);

        // Find all links in the page and navigate to them
        const links = await page.$$eval('a', anchors => anchors.map(a => a.href));
        for (let link of links) {
            if (link.startsWith(url)) { // Ensure we only navigate within the same domain
                await scrapeWebsite(link, new URL(link).pathname.split('/').pop() || 'homepage');
            }
        }

    } catch (error) {
        console.error("An error occurred while scraping:", error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Test the scraper with a sample website
scrapeWebsite('https://yexle.com')
    .then(() => console.log("Scraping completed!"))
    .catch(error => console.error("An error occurred:", error));

    //comment