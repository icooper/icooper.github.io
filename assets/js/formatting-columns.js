$('document').ready(function() {
    // first code block is the input json
    let input = JSON.parse($('#post-formatting-columns div.language-json pre.highlight').first().text());

    // extract the javascript code blocks from the post and combine them
    code = '(function() {\n';
    $('#post-formatting-columns div.language-javascript pre.highlight').each((i, el) => {
        code += $(el).text() + "\n";
    });
    code += 'return lines.join("\\n");\n}())';

    // execute the code and capture the output
    let output = eval(code);

    // put the output in the output code block
    $('#post-formatting-columns pre.highlight').last().text(output);
});
