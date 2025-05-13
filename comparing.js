const fs = require('fs');
const csv = require('csv-parser');
const {Builder, By} = require('selenium-webdriver');

let savedData = [];

fs.createReadStream('books.csv')
    .pipe(csv())
    .on('data', (row) => {
        savedData.push(row);
    })
    .on('end', async () => {
        console.log('CSV file successfully processed');
        await runPriceVerificationTest();
    });

async function runPriceVerificationTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        let currentData = [];

        for (let page = 0; page <= 2; page++) {
            if (page === 1) {
                await driver.get('https://books.toscrape.com');
            } else {
                await driver.get(`https://books.toscrape.com/catalogue/page-${page}.html`);
            }
        }

        await driver.sleep(2000); 

        let books = await driver.findElements(By.css('article.product_pod'));

        for (let book of books) {
            let title = await book.findElement(By.css('h3 > a')).getAttribute('title');
            let price = await book.findElement(By.css('p.price_color')).getText();
            currentData.push({title, price});
        }
        let discrepancies = [];
        for (let i = 0; i < savedData.length; i++) {
            let savedBook = savedData[i];
            try {
                const currentBook = books.find((book) => book.title === savedBook.title);

                if (currentBook) {
                    if (currentBook.price !== savedBook.price) {
                        discrepancies.push({
                            Title: savedBook.title,
                            SavedPrice: savedBook.price,
                            CurrentPrice: currentBook.price
                        });
                        console.log(`Price discrepancy found for "${savedBook.title}": Saved Price: ${savedBook.price}, Current Price: ${currentBook.price}`);
                    } else {
                        console.log(`Price matches for "${savedBook.title}": ${savedBook.price}`);
                    }
                } else {
                    console.log(`Book "${savedBook.title}" not found in current data.`);
                }
            } catch (error) {
                console.error("An error occurred while comparing books:", error);
            }
        }
    } catch (error) {
        console.error('Error during price verification:', error);
    } finally {
        await driver.quit();
    }
}
