$((function() {
    $("#sandblast2019-expenses-total code")
        .text(
            Math.round(
                $.makeArray(
                    $('#sandblast2019-expenses table > tbody > tr > td:first-of-type')
                ).reduce(function(a, c) {
                    return a + parseFloat($(c).text());
                }, 0.0) * 100
            ) / 100
        ).parent().show();
}));