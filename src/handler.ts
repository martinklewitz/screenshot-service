import chromium from 'chrome-aws-lambda'

// eslint-disable-next-line import/extensions
import {getPuppeteer} from './puppeteer.util'

export default async (event: any) => {
  const puppeteer = getPuppeteer()

  function waitFor(waiting: number) {
    return new Promise(resolve => {
      console.log("wait done");
      setTimeout(resolve, waiting)
    });
  }

  try {
    const params = event.queryStringParameters || {}
    const { url = '', waiting = 0, width = 1500, height = 900, waitForSelector = '' } = params
    const unescaped = unescape(url)

    if (!unescaped || !unescaped.startsWith('http')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ massage: 'you should specify page URL' }),
      }
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      dumpio: true,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
    })

    const page = await browser.newPage()
    page.setViewport({ width: Number(width), height: Number(height) })

    await page.goto(unescaped)

    // eslint-disable-next-line no-unused-vars
    if(waiting>0){
      // eslint-disable-next-line no-undef
      console.log(`wait:${waiting}`)
      await waitFor(waiting);
    }
    if(waitForSelector){
      await page.waitForSelector(waitForSelector,{timeout:60000})
      await waitFor(1000);
    }

    const imageBuffer = await page.screenshot()

    await browser.close();

    return {
      statusCode: 200,
      body: imageBuffer.toString('base64'),
      isBase64Encoded: true,
      headers: { 'Content-Type': 'image/png' },
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        massage: 'Something going wrong on backend side',
      }),
    }
  }
}
