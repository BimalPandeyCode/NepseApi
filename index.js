const moment = require("moment");
const fs = require("fs");
const {
  scrapeCompaniesData,
  scrapeMarketData,
  fetchData,
  groupMarketDataByCompany,
} = require("./scrapper_v3");
const { lastMarketDay } = require("./helpers");
const { deleteDownloadedCSV } = require("./helpers/puppet");
const { scrapeNepseTrading } = require("./scrapper_v4");

// FIX: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' issue with API call
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

async function runScript() {
  try {
    let date = moment();
    for (let i = 0; i <= 10; i++) {
      try {
        let dateStr = lastMarketDay(
          date.subtract(1, "days").format("YYYY-MM-DD")
        );
        console.log("Running for: ", dateStr);
        if (fs.existsSync(`./data/date/${dateStr}.json`)) continue;
        const data = await fetchData(dateStr);
        if (data) {
          scrapeCompaniesData(data);
          scrapeMarketData(data, dateStr);
          groupMarketDataByCompany(data, dateStr);
          deleteDownloadedCSV(dateStr);
        }
      } catch (e) {
        continue;
      }
    }

    fs.writeFileSync(
      "./data/info.json",
      JSON.stringify({
        name: "Nepse API",
        source: "https://nepalstock.com/",
        lastUpdatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      })
    );
  } catch (e) {
    console.log(e);
  }
}

runScript();

// scrapeNepseTrading()
//   .then((stocksArray) => {
//     const [data, date] = stocksArray;

//     if (fs.existsSync(`./data/date/${date}.json`)) return;
//     console.log(data, date);
//     if (data) {
//       scrapeCompaniesData(data);
//       scrapeMarketData(data, date);
//       groupMarketDataByCompany(data, date);
//       console.log("scraped data for", date);
//     }
//   })
//   .catch((err) => {
//     console.error("An error occurred:", err);
//   });

//  fetch last 7 market-days data
