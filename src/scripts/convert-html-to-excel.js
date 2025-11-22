import fs from "fs";
import * as cheerio from "cheerio";
import * as XLSX from "xlsx";

// Read the HTML file
const html = fs.readFileSync("public/ai_studio_code.html", "utf8");

// Load into cheerio
const $ = cheerio.load(html);

// Find the table
const table = $("table");

// Extract headers
const headers = [];
table.find("thead tr td").each((i, el) => {
	const text = $(el).text().trim();
	// Extract model name, e.g., "2023 Model 1.5L Manual Trend CNY 115,900" -> "1.5L Manual Trend"
	const match = text.match(/(\d{4} Model )?(.+?) CNY/);
	headers.push(match ? match[2] : text);
});

// Add empty first column for features
headers.unshift("Feature");

// Prepare data
const data = [headers];

// Process tbody
table.find("tbody").each((tbodyIndex, tbody) => {
	$(tbody)
		.find("tr")
		.each((trIndex, tr) => {
			const row = [];
			$(tr)
				.find("th, td")
				.each((cellIndex, cell) => {
					const colspan = $(cell).attr("colspan");
					const text = $(cell).text().trim();
					if (colspan && parseInt(colspan) > 1) {
						// Section header
						row.push(text);
						// Fill the rest with empty
						for (let i = 1; i < parseInt(colspan); i++) {
							row.push("");
						}
					} else {
						row.push(text);
					}
				});
			if (row.length > 0) {
				data.push(row);
			}
		});
});

// Create workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(data);

// Write to file
XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
XLSX.writeFile(wb, "public/vehicle_specs.xlsx");

console.log("Excel file created: public/vehicle_specs.xlsx");
