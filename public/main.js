document.addEventListener("DOMContentLoaded", event =>{
    $("#main").hide();
    $(".change-btn").on("click", function () {
        console.log("clicked")
        var id = $(this).attr("for");
        var val = parseInt($("#" + id).text());
        if ($(this).hasClass("increment"))
            $("#" + id).text(val + 1);
        else if (val > 0)
            $("#" + id).text(val - 1);
    })
    setUpEvent();
    $("#submit-btn").on("click", saveData);
})

function setUpEvent()
{
    getCurrentEvent()
    .then((event) => {
        $("#current-event").text($("#current-event").text() + event);
        setUpMatchOptions()
    })
}

function setUpMatchOptions()
{
    getMatches()
    .then((matches) => {
        for (match of matches)
            $("#match-choices").append(getMatchOption(match));
        $("#match-choices").on("change", function () {
            setUpTeamOptions($("#match-choices option:selected").text());
            $("#main").hide();
        })
    })
}

function setUpTeamOptions(match)
{
    getTeamsInMatch(match)
    .then((teams) => {
        $("#team-choices").html("<option disabled selected value> -- select an option -- </option>");
        $("#team-choices").removeClass("text-white");
        $("#team-choices").css("background-color", "")

        for(team of teams.blue)
            $("#team-choices").append(getTeamOption(team, "blue"));
        for(team of teams.red)
            $("#team-choices").append(getTeamOption(team, "red"));
        // Resets and reveals the form when a new team is selected
        $("#team-choices").on("change", function () {
            if ($("option:selected", this).hasClass("blue"))
                $(this).css("background-color", "blue")
            else
                $(this).css("background-color", "red")
            $(this).addClass("text-white");
            reset();
            $("#main").show();
        })
    })
}

function getMatchOption(match) {
    return `<option>${match}</option>`;
}

function getTeamOption(team, color) {
    return `<option class = "${color}">${team}</option>`
}

async function getInputtedData(){
   return getEmptyMatchData()
    .then(data =>{
        data.match = $("#match-choices option:selected").text();
        data.team = $("#team-choices option:selected").text();
        $(".data").each(function (index, obj) {
            var path = $(this).attr("id").split("-");
            console.log(path);
            //This temp object is used to traverse down the data in the path given
            var temp = data.gamePlay;
            for (i = 0; i < path.length - 1; i++)
                temp = temp[path[i]];

            if ($(this).hasClass("form-check-input"))
                temp[path[i]] = $(this).is(':checked') ? 1 : 0;
            else
                temp[path[i]] = parseInt($(this).text().trim());
        });
        return data;
    });

}

function reset(){
    $(".form-control").each(function (index, obj) {
        $(this).text(0);
    })

    $(".form-check-input").each(function (index, obj) {
        $(this).prop('checked', false);
    })
}