import fs from "fs/promises";
import axios from "axios";
import * as cheerio from "cheerio";
import _ from "lodash";

const cacheFilePath = "content.json";

// A piece of content: press release, remark, commentary, or letter.
//
interface Content {
  date: string,
  title: string;
  link: string | undefined;
}

async function scrapeData(url: string) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const contentTable = $("#browser_table tr");
  const contentList: Content[] = [];

  contentTable
    .filter((_, element) => {
      // The table use `tr`s with class="divider" to separate months.
      //
      return !$(element).hasClass("divider");
    })
    .map((_, contentHtml) => {
      // The structure of each tr is as follows:
      //  <tr>
      //    <td class="date">
      //      <time datetime="..."></time>
      //    </td>
      //    <td>
      //      <a href="...">...</a>
      //    </td>
      //  </tr>
      //
      const date = $(contentHtml).find("td:first-child")
        .text()
        .trim();

      const title = $(contentHtml).find("td:nth-child(2)")
        .find("a")
        .text()
        .trim();

      const link = $(contentHtml).find("td:nth-child(2)")
        .find("a")
        .attr("href")
        ?.toString().trim();

      contentList.push({
        date,
        title,
        link
      });
    });

  return contentList.sort((pressReleaseA, pressReleaseB) => new Date(pressReleaseA.date).getTime() - new Date(pressReleaseB.date).getTime());
}

async function writeJsonBlobToFile(blob: Content[]) {
  // Read existing content cache.
  //
  const cache = await fs.readFile(cacheFilePath, "utf-8");
  const cacheContent: Content[] = JSON.parse(cache);

  const differences = _.xorBy(cacheContent, blob, 'title');
  if (differences.length > 0) {
    console.log("New content");
    console.log("--------------");
    console.log(differences);
  } else {
    console.log("No new content!");
  }

  // Write the new cache in regardless.
  //
  await fs.writeFile(cacheFilePath, JSON.stringify(blob), "utf-8");
}

scrapeData("https://www.finance.senate.gov/chairmans-news").then(data =>
  writeJsonBlobToFile(data)
);
