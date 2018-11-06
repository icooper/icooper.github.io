---
layout: post
title: Column Formatting for Text Reports
date: 2018-11-01
scripts: ['/assets/js/formatting-columns.js']
---

Here's the scenario: we have a system that outputs plain-text reports with data formatted into a table. Our raw data comes in JSON format; we'll use this as the input to our program:

```json
{
    "data": [
        {
            "Sample Name": "X24-03",
            "Date": "01-Nov-2018",
            "Moisture Content": "4.85 wt. %",
            "Volatile Matter": "79.29 wt. %",
            "Fixed Carbon by Difference": "15.62 wt. %",
            "Gross Caloric Value at Constant Volume": "19985 J/g",
            "Ash": "0.25 wt. %"
        },
        {
            "Sample Name": "X24-02",
            "Date": "31-Oct-2018",
            "Moisture Content": "4.52 wt. %",
            "Volatile Matter": "80.91 wt. %",
            "Fixed Carbon by Difference": "16.01 wt. %",
            "Gross Caloric Value at Constant Volume": "20004 J/g",
            "Ash": "0.23 wt. %"
        },
        {
            "Sample Name": "X24-01",
            "Date": "30-Oct-2018",
            "Moisture Content": "4.68 wt. %",
            "Volatile Matter": "80.03 wt. %",
            "Fixed Carbon by Difference": "15.89 wt. %",
            "Gross Caloric Value at Constant Volume": "19996 J/g",
            "Ash": "0.24 wt. %"
        }
    ]
}
```

## Create Grid

Using the built-in `JSON.parse()` function, we take the above JSON and interpret it as a JavaScript object called `input`. Next, we need to transform it into a simple 2-dimensional array of strings that we'll refer to as our grid. The first row of the grid is made up of the column names, and each row after that is data.

```javascript
// initialize our grid with the first row as the keys of the input data objects
let grid = [Object.keys(input.data[0])];

// load the rest of the rows into the grid
input.data.forEach(row => {
    grid.push(grid[0].map(key => row[key]));
});
```

## Minimum Column Widths

Let's continue by calculating the minimum column width for each column in the grid. We'll say that we don't want any columns narrower than 7 characters wide. We also don't want to wrap any of the actual data values, so we'll break down the column headers (in `grid[0]`) into words but not the rest of the rows.

```javascript
// minimum column width
const minimumColumnWidth = 7

// calculate the column widths
let columnWidths = new Array(grid[0].length)
    .fill(minimumColumnWidth)
    .map((width, i) => Math.max(...grid.map((row, j) => {
        
        // is this the first row?
        if (j === 0) {
            // find the width of the longest word
            return Math.max(...row[i].split(/\b/).map(w => w.length));
        } else {
            // find the width of the whole contents
            return row[i].length;
        }
    }).concat(width)));
```

## Print Column Headers

Great, now that we have the width of each column, we can continue with outputting the column header lines. Because of the wrapping, some column headers will take more lines than others, so we'll take care to pad the header lines such that the column headers are aligned to the bottom.

```javascript
// wrap the column headers based on the calculated widths
let headers = columnWidths.map((w, i) => {
    return grid[0][i].split(/\s+/).reduce((accumulator, current) => {
        if (accumulator.length == 0) {
            return [current];
        } else {
            const lastLine = accumulator.pop();
            const testLine = lastLine + ' ' + current;
            if (testLine.length <= w) {
                return accumulator.concat(testLine);
            } else {
                return accumulator.concat(lastLine, current);
            }
        }
    }, []);
});

// how many header lines do we need?
const headerHeight = Math.max(...headers.map(x => x.length));

// pad our headers with blank lines so the content is bottom-aligned
headers = headers.map(h =>
    new Array(headerHeight - h.length).fill('').concat(...h));

// create the headers
let lines = new Array(headerHeight).fill('').map((h, i) => 
    columnWidths.map((w, j) => headers[j][i].padEnd(w)).join(' '));

// create the separator lines
lines.push(columnWidths.map(w => ''.padEnd(w, '-')).join(' '));

```

## Print Data Rows

Printing the data rows is a bit simpler as we do not do any wrapping, although we still pad the end of each cell with spaces using `String.padEnd()` to help everything line up correctly.

```javascript
// compose each data line
grid.forEach((row, i) => {

    // skip the first line, we already have the headers
    if (i > 0) {
        lines.push(columnWidths.map((w, j) => row[j].padEnd(w)).join(' '));
    }

});

// print out the lines
console.log(lines.join('\n'));
```

## Output

Here's what the program outputs to the console:

```
                                                       Gross               
                                                       Caloric             
                                           Fixed       Value at            
Sample              Moisture   Volatile    Carbon by   Constant            
Name    Date        Content    Matter      Difference  Volume    Ash       
------- ----------- ---------- ----------- ----------- --------- ----------
X24-03  01-Nov-2018 4.85 wt. % 79.29 wt. % 15.62 wt. % 19985 J/g 0.25 wt. %
X24-02  31-Oct-2018 4.52 wt. % 80.91 wt. % 16.01 wt. % 20004 J/g 0.23 wt. %
X24-01  30-Oct-2018 4.68 wt. % 80.03 wt. % 15.89 wt. % 19996 J/g 0.24 wt. %
```

[You can download the complete code here.](/assets/js/formatting-columns.js)

## Next Steps

[In the next installment]({% link _posts/2018-11-05-parsing-units.md %}), we'll update the program to make the output more readable by wrapping column headers a little better and parsing out the units.