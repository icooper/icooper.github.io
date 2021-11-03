(function() {

    // our input data
    let input = {
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
    };

    // initialize our grid with the first row as the keys of the input data objects
    let grid = [Object.keys(input.data[0])];

    // load the rest of the rows into the grid
    input.data.forEach(row => {
        grid.push(grid[0].map(key => row[key]));
    });

    // minimum column width
    const minimumColumnWidth = 7;

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


    // compose each data line
    grid.forEach((row, i) => {

        // skip the first line, we already have the headers
        if (i > 0) {
            lines.push(columnWidths.map((w, j) => row[j].padEnd(w)).join(' '));
        }

    });

    // print out the lines
    console.log(lines.join('\n'));

})();