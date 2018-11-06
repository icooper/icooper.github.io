(function() {

    // our input data
    const input = {
        "data": [
            {
                "Sample Name": "X24-03",
                "Date": "01-Nov-2018",
                "Fixed Carbon by Difference": "15.62 wt. %",
                "Gross Caloric Value at Constant Volume": "19985 J/g",
                "Ash": "0.25 wt. %"
            },
            {
                "Sample Name": "X24-02",
                "Date": "31-Oct-2018",
                "Fixed Carbon by Difference": "16.01 wt. %",
                "Gross Caloric Value at Constant Volume": "20004 J/g",
                "Ash": "0.23 wt. %"
            },
            {
                "Sample Name": "X24-01",
                "Date": "30-Oct-2018",
                "Fixed Carbon by Difference": "15.89 wt. %",
                "Gross Caloric Value at Constant Volume": "19996 J/g",
                "Ash": "0.24 wt. %"
            }
        ]
    };

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

})();