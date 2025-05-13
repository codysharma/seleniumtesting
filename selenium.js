const { Builder } = require('selenium-webdriver');

async function openGoogleInChrome() {
    let driver = await new Builder().forBrowser('chrome').build();

    url = 'https://the-internet.herokuapp.com/login'

    await driver.get(url)

    await driver.sleep(3000); 

    const usernameField = await driver.findElement({ xpath: '//*[@id="username"]' });
    await usernameField.sendKeys('tomsmith');

    const passwordField = await driver.findElement({ xpath: '//*[@id="password"]' });
    await passwordField.sendKeys('SuperSecretPassword!');

    const loginButton = await driver.findElement({ xpath: '//*[@id="login"]/button' });
    await loginButton.click();

    await driver.sleep(2000);

    try {
        const successMessage = await driver.findElement({ css: '.flash.success' });
        console.log('Login successful:', await successMessage.getText());
        await driver.takeScreenshot().then(
            function(image) {
                require('fs').writeFileSync('login-success.png', image, 'base64');
            }
        )
    } catch (error) {
        console.log('Login failed:', error.message);
        await driver.takeScreenshot().then(
            function(image) {
                require('fs').writeFileSync('login-failed.png', image, 'base64');
            }
        )
    }

    // const logoutButton = await driver.findElement({ xpath: '//*[@id="content"]/div/a' });
    // await logoutButton.click();

    await driver.sleep(2000);

    // await driver.quit();

}

openGoogleInChrome().catch(console.error);