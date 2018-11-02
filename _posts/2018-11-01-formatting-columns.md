---
layout: post
title: Column Formatting for Text Reports
date: 2018-11-01
---

<style type="text/css">
    div.post > table:first-of-type, code.language-size-small { font-size: 0.7rem; }
    div.post > table:first-of-type td { white-space: nowrap; }
</style>

Here's the scenario: we have a system that outputs plain-text reports with data formatted into a table.
Our raw data comes in JSON format; we'll use this as the input to our program:

```json
{
    "columns": [
        "Sample Name",
        "Date",
        "Moisture Content",
        "Volatile Matter",
        "Fixed Carbon by Difference",
        "Gross Caloric Value at Constant Volume",
        "Ash"
    ],
    "data": [
        {
            "Sample Name": "X24-03",
            "Date": "01-Nov-2018",
            "Moisture Content": "4.85 wt. %",
            "Volatile Matter": "79.29 wt. %",
            "Fixed Carbon by Difference": "15.62 wt. %",
            "Gross Caloric Value at Constant Volume": "19985 wt. %",
            "Ash": "0.25 wt. %"
        },
        {
            "Sample Name": "X24-02",
            "Date": "31-Oct-2018",
            "Moisture Content": "4.52 wt. %",
            "Volatile Matter": "80.91 wt. %",
            "Fixed Carbon by Difference": "16.01 wt. %",
            "Gross Caloric Value at Constant Volume": "20004 wt. %",
            "Ash": "0.23 wt. %"
        },
        {
            "Sample Name": "X24-01",
            "Date": "30-Oct-2018",
            "Moisture Content": "4.68 wt. %",
            "Volatile Matter": "80.03 wt. %",
            "Fixed Carbon by Difference": "15.89 wt. %",
            "Gross Caloric Value at Constant Volume": "19996 wt. %",
            "Ash": "0.24 wt. %"
        }
    ]
}
```

## Read JSON

Reading our JSON file in Python is pretty easy.

```python
# load the library for JSON parsing
import json

# initialize our input data array
input_data = []

# read the JSON file and put the contents into input_data
with open('data.json') as json_data:
    input_data = json.load(json_data)
```

## Create Grid

Now that we have our input data loaded into a Python dictionary, we need to transform it into a simple 2-dimensional array of strings that we'll refer to as our grid. The first row of the grid is made up of the column names, and each row after that is data.

```python
# initialize our grid
grid = []

# populate the first row of the grid with the column list
grid.append(input_data['columns'])

# populate the rest of the grid with the data from the objects
for row in input_data['data']:
    grid.append(map(lambda i: row[i], grid[0]))
```

## Minimum Column Widths

Let's continue by calculating the minimum column width for each column in the grid. We'll say that we don't want any columns narrower than 7 characters wide. We also don't want to wrap any of the actual data values, so we'll break down the column headers (in `grid[0]`) into words but not the rest of the rows.

```python 
# initialize our list of column widths
col_widths = [7] * len(grid[0])

# for each column in the grid
for column in range(0, len(grid[0])):

    # for each row in that column
    for row in range(0, len(grid)): 

        # is this the column header?
        if row == 0:

            # find the width of the longest word in the cell
            col_widths[column] = max(
                map(
                    lambda x: len(x),
                    grid[row][column].split(' ')
                ) + [col_widths[column]]
            )
        
        # this is a normal data row
        else:

            # find the width of the whole cell
            col_widths[column] = max(
                col_widths[column],
                len(grid[row][column])
            )
```

## Print Column Headers

Great, now that we have the width of each column, we can continue with outputting the column header lines. Because of the wrapping, some column headers will take more lines than others, so we'll take care to pad the header lines such that the column headers are aligned to the bottom. We use `string.format()` to pad text so that the columns all line up nicely

```python
# load the library for text wrapping
from textwrap import wrap

# put together the column headers
headers = map(
    lambda i: wrap(grid[0][i], col_widths[i]),
    range(0, len(grid[0]))
)

# how many header lines do we need?
header_height = max(
    map(
        lambda i: len(i),
        headers
    )
)

# pad each of the headers with some empty lines
headers = map(
    lambda i: ([''] * (header_height - len(i))) + i,
    headers
)

# print the header lines
for h in range(0, header_height):
    print ' '.join(
        map(
            lambda i: '{text: <{width}}'.format(
                text = headers[i][h],
                width = col_widths[i]
            ),
            range(0, len(headers))
        )
    )

# print the header separator line
print ' '.join(
    map(
        lambda i: '-' * col_widths[i],
        range(0, len(col_widths))
    )
)
```

## Print Data Rows

Printing the data rows is a bit simpler as we do not do any wrapping, though we still use `string.format()` to pad each cell so that the alignment is good.

```python
# print each data line
for i in range(1, len(grid)):
    print ' '.join(
        map(
            lambda j: '{text: <{width}}'.format(
                text = grid[i][j],
                width = col_widths[j]
            ),
            range(0, len(grid[i]))
        )
    )
```

## Output

Here's the output of the program:

```size-small
                                                       Gross                 
                                                       Caloric               
                                           Fixed       Value at              
Sample              Moisture   Volatile    Carbon by   Constant              
Name    Date        Content    Matter      Difference  Volume      Ash       
------- ----------- ---------- ----------- ----------- ----------- ----------
X24-03  01-Nov-2018 4.85 wt. % 79.29 wt. % 15.62 wt. % 19985 wt. % 0.25 wt. %
X24-02  31-Oct-2018 4.52 wt. % 80.91 wt. % 16.01 wt. % 20004 wt. % 0.23 wt. %
X24-01  30-Oct-2018 4.68 wt. % 80.03 wt. % 15.89 wt. % 19996 wt. % 0.24 wt. %
```

## Next Steps

In the next installment, we'll update the program to make the output more readable.