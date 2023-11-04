const puppeteer = require('puppeteer');

let visitedUrls = new Set();

async function scrapeWebsite(url, triggeringComponent = 'root') {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    let structure = {
        name: triggeringComponent,
        url: url,
        children: []
    };

    if (visitedUrls.has(url)) {
        await browser.close();
        return structure;
    }
    visitedUrls.add(url);

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Find all links in the page and navigate to them
    const links = await page.$$eval('a', anchors => anchors.map(a => ({ href: a.href, text: a.textContent.trim() })));
    for (let link of links) {
        if (link.href.startsWith(url) && !visitedUrls.has(link.href)) { // Ensure we only navigate within the same domain
            const childStructure = await scrapeWebsite(link.href, link.text || 'Unnamed Link');
            structure.children.push(childStructure);
        }
    }

    await browser.close();
    return structure;
}

module.exports = scrapeWebsite;

//test scraper
scrapeWebsite('https://www.maitridesigns.com/')
    .then(data => console.log(JSON.stringify(data, null, 2)))
    .catch(error => console.error("Error:", error));

//comment