const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

// List of URLs to scrape proxies from
const proxyUrls = [
  'https://api.proxyscrape.com/?request=displayproxies&proxytype=http',
  'https://proxyspace.pro/http.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
  'https://api.openproxylist.xyz/http.txt',
  // Add more URLs as needed
];

// Function to scrape proxies from multiple web pages
async function scrapeProxies(urls) {
  const proxies = [];

  for (const url of urls) {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Adjust the selector to match the structure of the webpage you are scraping
      $('tr').each((index, element) => {
        const ip = $(element).find('td').eq(0).text().trim();
        const port = $(element).find('td').eq(1).text().trim();
        if (ip && port) {
          proxies.push(`http://${ip}:${port}`);
        }
      });
    } catch (error) {
      console.error(`Error scraping proxies from ${url}: ${error.message}`);
    }
  }

  return proxies;
}

// Function to check if a proxy is working
async function checkProxy(proxy) {
  try {
    const response = await axios.get('http://example.com', {
      proxy: {
        host: proxy.split(':')[1].replace('//', ''),
        port: parseInt(proxy.split(':')[2]),
      },
      timeout: 5000
    });
    
    if (response.status === 200) {
      console.log(`Working proxy: ${proxy}`);
      return proxy;
    }
  } catch (error) {
    console.log(`Failed proxy: ${proxy}`);
  }
}

// Function to save working proxies to a file
async function saveWorkingProxies(proxies) {
  await fs.writeFile('proxy.txt', proxies.join('\n'), 'utf-8');
  console.log('Valid proxies have been saved to proxy.txt');
}

// Main function to scrape and check proxies
async function main() {
  const proxies = await scrapeProxies(proxyUrls);
  const checkPromises = proxies.map(proxy => checkProxy(proxy));

  const workingProxies = (await Promise.all(checkPromises)).filter(Boolean);
  
  if (workingProxies.length > 0) {
    await saveWorkingProxies(workingProxies);
  } else {
    console.log('No working proxies found.');
  }
}

main();
