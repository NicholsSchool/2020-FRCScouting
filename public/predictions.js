document.addEventListener("DOMContentLoaded", event => {
    $("#prediction-card").hide();
    setUpChoices();
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
        console.log("Error: " + error);
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