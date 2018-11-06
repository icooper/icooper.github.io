---
layout: post
title: 'Text Reports II: Extract Units'
date: 2018-11-05
scripts: ['/assets/js/extract-units.js']
---

Building on [the first installment]({% link _posts/2018-11-01-formatting-columns.md %}), let's improve the formatting by pulling the units out of the rows and putting them in the header instead. We'll use the same data as before.

## Define Pattern

Using a regular expression, we can easily determine if a cell contains a numeric value with a unit and then extract both parts. Let's create a function that takes the cell contents as an input and returns the unit (or `false` if no units are found).

```javascript
// extract the units from a string
function extractUnits(str) {

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
}
```

## Extract Units

Now that we have a function that will parse the string and pull out the units if there are any, let's create an array that contains the units for each column (based on the first row). We are making the assumption that the units will be the same in every cell in a given column, and that the first data row exists with no blank values.

```javascript
// make a list of units based on the first row of data
const units = grid[1].map(value => extractUnits(value));
```

Now that we've determined what the units are, we need to remove the units from the grid.

```javascript
// remove the units from the grid
grid = grid.map((row, i) => {

    // is this the header row?
    if (i == 0) {

        // don't change anything
        return row;
    } else {

        // if we have a unit, remove it from the cell
        return row.map((x, j) => units[j] ? x.split(/\s/)[0] : x);
    }
});
```

## Column Widths

With the units moving to the header, we need to make sure the column widths are all wide enough. Let's update the width calculation to make sure that the units are included when we're looking at the header row words. We consider the whole unit string as a "word" in this case as we do not want to break in the middle of the unit string.
```javascript
// calculate the column widths
let columnWidths = new Array(grid[0].length)
    .fill(minimumColumnWidth)
    .map((width, i) => Math.max(...grid.map((row, j) => {
        
        // is this the first row?
        if (j === 0) {
            // find the width of the longest word (including the units)
            return Math.max(...row[i].split(/\b/)                      // words
                                     .concat(units[i] ? units[i] : []) // units
                                     .map(w => w.length));             // lengths
        } else {
            // find the width of the whole contents
            return row[i].length;
        }
    }).concat(width)));
```

## Header

Now that we've extracted the units and taken them into consideration when sizing the columns, let's update the code to print the units as part of the column headers. The units will come out on the bottom line of the header.

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
    }, []).concat(units[i] ? units[i] : []); // add units
});
```

## Output

With our changes, the output now looks like this:

```
                                                 Gross           
                                                 Caloric         
                                      Fixed      Value at        
                    Moisture Volatile Carbon by  Constant        
Sample              Content  Matter   Difference Volume   Ash    
Name    Date        wt. %    wt. %    wt. %      J/g      wt. %  
------- ----------- -------- -------- ---------- -------- -------
X24-03  01-Nov-2018 4.85     79.29    15.62      19985    0.25   
X24-02  31-Oct-2018 4.52     80.91    16.01      20004    0.23   
X24-01  30-Oct-2018 4.68     80.03    15.89      19996    0.24   
```

[You can download the complete code here.](/assets/js/extract-units.js)

## Next Steps

[In the next iteration]({% link _posts/2018-11-06-fill-width.md %}), we'll improve the layout by expanding to fill the page width.