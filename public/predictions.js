document.addEventListener("DOMContentLoaded", event => {
    $("#prediction-card").hide();
    setUpChoices();
    setUpMatches();
    $("#match-select-btn").on("click", function() {
        if ($("#match-select option:selected").text().length > 6)
            return;
        getTeamsInMatch($("#match-select option:selected").text())
        .then(teams => {
            console.log(teams);
            $(".blue-select").each(function(index) {
                $(this).val(teams.blue[index]);
            })
            $(".red-select").each(function (index) {
                $(this).val(teams.red[index]);
            }) 
        })
    })

    $("#predict-btn").on("click", function() {
        var blueAlliance = [];
        var redAlliance = [];
        var error = false;
        $(".team-select").each(function () {
            if ($(this).find(":selected").text().length > 6)
            {
                $("#prediction-error").show();
                error = true;
                return false;
            }
            if($(this).parent().parent().hasClass("blue"))
                blueAlliance.push($(this).find(":selected").text());
            else
                redAlliance.push($(this).find(":selected").text());
        })
        if(!error)
            getPrediction(blueAlliance, redAlliance)
            .then(prediction => {
                $("#prediction-error").hide();
                $("#prediction-card").show();
                $("#blue-score").text(prediction.blue);
                $("#red-score").text(prediction.red);
                if(prediction.blue > prediction.red)
                {
                    $('#winner').text("Blue")
                    $('#winner').parent().css('background-color', 'deepskyblue')
                }
                else if (prediction.red > prediction.blue)
                {
                    $('#winner').text("Red")
                    $('#winner').parent().css('background-color', 'crimson')
                }
                else
                {
                    $('#winner').text("Tie")
                    $('#winner').parent().css('background-color', 'mediumpurple')
                }
            })
    })
})

function setUpMatches()
{
    getMatches()
    .then((matches) => {
        for (match of matches)
            $("#match-select").append(`<option>${match}</option>`);
    })
}

function setUpChoices()
{
    getAllTeams()
    .then(teams => {
        $(".team-select").each(function() {
            for (team of teams)
                $(this).append(`<option>${team}</option>`);
        })
    })
}