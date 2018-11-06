---
layout: post
title: 'Text Reports III: Filling the Page'
date: 2018-11-06
scripts: ['/assets/js/fill-width.js']
---

Continuing to build on the [first]({% link _posts/2018-11-01-formatting-columns.md %}) and [second]({% link _posts/2018-11-05-extract-units.md %}) installments, let's try to reduce the wrapping used by expanding to fill the page width.

We'll continue to use the same data as before, but with the _Moisture Content_ and _Volatile Matter_ columns removed to give us room to expand. Thus we start with this:

```
                               Gross           
                               Caloric         
                    Fixed      Value at        
                    Carbon by  Constant        
Sample              Difference Volume   Ash    
Name    Date        wt. %      J/g      wt. %  
------- ----------- ---------- -------- -------
X24-03  01-Nov-2018 15.62      19985    0.25   
X24-02  31-Oct-2018 16.01      20004    0.23   
X24-01  30-Oct-2018 15.89      19996    0.24   
```

The output above only uses 48 columns of text, so you can see there's lots of room to grow.

## How Wide?

We need to define how many columns of text can fit on a page. The code blocks that I use on this site comfortably fit about 80 columns---at least in my browser---so we'll use that. We'll set the page width next to where we set the minimum column width.

```javascript
    // page width and minimum column width
    const minimumColumnWidth = 7;
    const pageWidth = 80;
```

## Let's Get Organized

Our approach to filling the space will be by increasing the width of the most-wrapped header columns in an effort to reduce the wrapping. We define _most-wrapped_ as the column header that has the greatest height.

To do this, let's first reorganize our code a bit to make it more modular. First, we'll make a word-wrap function based on the wrapping code we've used previously. Note that it returns an array of lines rather than a single string with newlines.

```javascript
// wrap text to a specific length
function wrapText(str, len) {

    // split the string into words and use Array.reduce() to condense it into
    // lines that are all less than or equal to the target length
    return str.split(/\s+/).reduce((accumulator, current) => {

        // is this the first word?
        if (accumulator.length == 0) {

            // start a new line with the first word
            return [current];
        } else {

            // get the last line
            const lastLine = accumulator.pop();

            // add the next word to the last line
            const testLine = lastLine + ' ' + current;

            // is this line less than or equal to the target length?
            if (testLine.length <= len) {

                // add the line to the list
                return accumulator.concat(testLine);
            } else {

                // otherwise add the unmodified line to the list and start a
                // new line with the next word
                return accumulator.concat(lastLine, current);
            }
        }
    }, []);
}
```

Next, let's take our code to extract the units from the first data row of the grid and strip them out of all of the values and move it all into its own function which modifies the grid and returns the units. This is updated a little bit from the previous installment in order to modify the grid in place.

```javascript
// extract the units from a string
function extractUnits(grid) {

    // check each cell in the first data row of the grid
    const units = grid[1].map(str => {

        // compare with the regular expression
        const matches = str.match(/\d+(\.\d+)?\s+(.+)/);

        // was there a match?
        if (matches !== null) {

            // return the units
            return matches[2];
        } else {

            // otherwise return false
            return false;
        }
    });

    // remove the units from the grid
    grid.forEach((row, i) => {

        // is this a data row?
        if (i > 0) {

            // if we have a unit, remove it from the cell
            grid[i] = row.map((x, j) => units[j] ? x.split(/\s/)[0] : x);
        }
    });

    // return the units; the grid is already modified
    return units;
}
```

Finally, let's take the code which renders the grid into text and put that into its own function. As an input, we'll give it the main grid data, the units, and the desired column widths.

```javascript
// render the grid into text
function gridToLines(grid, units, columnWidths) {

    // wrap the column headers based on the calculated widths
    const headers = columnWidths.map((w, i) =>
        wrapText(grid[0][i], w).concat(units[i] ? units[i] : []));

    // how many header lines do we need?
    const headerHeight = Math.max(...headers.map(x => x.length));

    // pad our headers with blank lines so the content is bottom-aligned
    headers.forEach(h => {
        h.unshift(...new Array(headerHeight - h.length).fill(''));
    });

    // format as lines
    return new Array(headerHeight)
        .fill('').map((h, i) =>
            columnWidths.map((w, j) => headers[j][i].padEnd(w)).join(' '))
        .concat(columnWidths.map(w => ''.padEnd(w, '-')).join(' '))
        .concat(...grid.slice(1).map(row =>
            columnWidths.map((w, j) => row[j].padEnd(w)).join(' ')));
}
```

## This Wide

Now that we have our existing code a little better organized, let's move into the new stuff. We want to incrementally make the tallest (defined by header height) column wider until it is shorter and we still fit on the page. Let's start by writing a function which, given a string and a target height, will tell us the smallest wrapping width to acheive the target height.

```javascript
// find the minimum width to wrap text to a target height
function calcWidth(str, targetHeight = 0) {

    // start with the minimum width possible without breaking words
    let width = Math.max(...str.split(/\s+/).map(w => w.length));

    // calculation for the height
    const heightCalc = (str, width) => wrapText(str, width).length;

    // increase the width until we reach the target height
    while (targetHeight > 0 && heightCalc(str, width) > targetHeight) {
        width++;
    }

    // return the width used to hit the target height
    return width;
}
```

Note that in `targetHeightWidth()` we made `targetHeight` an optional parameter with a default value of zero. We'll reuse this function later to calculate the minimum possible width of a column.

Now we get to the meat---how do we expand things to fill the page width? The basic algorithm is this:

1. Find the "tallest" column header.
2. Expand it so that it's one row shorter.
3. If we're still narrower than the page width, repeat from the top.

Here's the code integrated in a function to calculate the column widths.

```javascript
// find the optimal column widths
function calcWidths(grid, units, minimumColumnWidth, pageWidth) {

    // calculate the minimum column widths
    let columnWidths = new Array(grid[0].length)
        .fill(minimumColumnWidth)
        .map((width, i) => Math.max(...grid.map((row, j) =>
            j === 0 ? calcWidth(row[i]) : row[i].length).concat(width)));

    // iterate until we fill the page
    let newWidths = columnWidths.slice(0);
    do {

        // use the new widths
        columnWidths = newWidths;

        // find the tallest column
        let tallest = columnWidths
            .map((w, i) => ({ i, h: wrapText(grid[0][i], w).length }))
            .sort((a, b) => a.i - b.i)
            .sort((a, b) => b.h - a.h)[0];

        // if our tallest column has a height of 1, bail on the loop
        if (tallest.h <= 1) break;

        // make a copy of the column widths
        newWidths = columnWidths.slice(0);

        // update the width of the tallest column
        newWidths[tallest.i] = calcWidth(grid[0][tallest.i], tallest.h - 1);

        // repeat if we're still under the target width
    } while (newWidths.reduce((a, c) => a + c + 1, -1) <= pageWidth);

    // return the column widths
    return columnWidths;
}
```

It's not an optimal algorithm, but it gets us close enough to be functional. Perhaps we'll improve on it in a later iteration.

## Put It Together

We've refactored the code into a bunch of functions, so let's put it all together. Here's the main code that calls the functions above:

```javascript
// page width and minimum column width
const minimumColumnWidth = 7;
const pageWidth = 80;

// populate the grid from our input data
const grid = [Object.keys(input.data[0])];
input.data.forEach(row => {
    grid.push(grid[0].map(key => row[key]));
});

// extract the units from the grid
const units = extractUnits(grid);

// calculate the column widths
const columnWidths = calcWidths(grid, units, minimumColumnWidth, pageWidth);

// print out the grid
console.log(gridToLines(grid, units, columnWidths).join('\n'));
```

## Output

With a specified page width of 80 columns, this is the output that we get:

```
                                                   Gross Caloric Value        
                        Fixed Carbon by Difference at Constant Volume  Ash    
Sample Name Date        wt. %                      J/g                 wt. %  
----------- ----------- -------------------------- ------------------- -------
X24-03      01-Nov-2018 15.62                      19985               0.25   
X24-02      31-Oct-2018 16.01                      20004               0.23   
X24-01      30-Oct-2018 15.89                      19996               0.24   
```

[You can download the complete code here.](/assets/js/fill-width.js)

## Next Steps

In the next iteration, we'll handle wrapping of the entire table if the columns are too wide to fit in the width of the page.