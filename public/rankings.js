var highlightedTeams = [];
document.addEventListener("DOMContentLoaded", event => {
    setUpTeams();
    setUpOptions();
    $("#ranking-num-teams-group").hide();

    $("#num-teams-check").on("click", function() {
        $(this).is(':checked') ? $("#ranking-num-teams-group").hide() : $("#ranking-num-teams-group").show();
    })

    $("#highlight-btn").on("click", function() {
       var team =  $("#highlight-team option:selected").text();
        $("#highlight-team option:selected").remove();
       if(team.length > 6)
            return;
        var style = [team, $("#highlight-color").val()];
        highlightedTeams.push(style)
        $("tr").each(function() {
            if($(this).children().eq(1).text() == team)
                $(this).css("background-color", style[1]);
        })

        $("#highlight-key").append(`<div class="row my-3 justify-content-center">
                    <div class="border col-1" style="background-color: ${style[1]}"></div>
                    <div class="col-4"><h5> - ${team}</h5></div>
                    <div class="col-1 ">
                        <div data-team = "${team}"class="text-center delete-highlight btn btn-outline-danger">
                            <i class="fas fa-times"></i>
                        </div>
                    </div> 
        </div>`);
        console.log(highlightedTeams);
    })

    $("#get-btn").on("click", setRankedTable)

    $(document).on("click", ".delete-button", function() {
        $("#ranking-select").append(`<option>${$(this).attr('data-choice')}</option>`)
        $(this).parent().parent().remove();
    })

    $(document).on("click", ".delete-highlight", function() {
        var team = $(this).attr('data-team');
        $("tr").each(function () {
            if ($(this).children().eq(1).text() == team)
                $(this).css("background-color", "");
        })
        for(i in highlightedTeams)
            if(highlightedTeams[i][0] == team)
                highlightedTeams.splice(i, 1);
        $("#highlight-team").append(`<option>${team}</option>`);
        $(this).parent().parent().remove();
    })
})

function setUpTeams()
{
    getAllTeams()
    .then((teams) => {
        for(team of teams)
            $("#highlight-team").append(`<option>${team}</option>`);
    })
}

function setUpOptions()
{
    getEmptyMatchData()
        .then((data) => {
            data = data.gamePlay;
            var rankingOptions = [];
            for (gamePeriod in data)
                for (action in data[gamePeriod])
                    rankingOptions.push(capitalize(gamePeriod) + " " + capitalize(action));
            rankingOptions.push("Total Score")
            for (option of rankingOptions)
                $("#ranking-select").append(`<option>${option}</option>`);
        })
}

function setRankedTable()
{
    var choice = $("#ranking-select option:selected").text();
    $("#ranking-select option:selected").remove();
    var path = "averages." + choice.toLowerCase().replace(" ", ".");
    if(choice == "Total Score")
        path = "averages.totalScore";
    var numTeams = !$("#num-teams-check").is(':checked') ? $("#ranking-num-teams").val() : 0;
    var isReversed = $("#reversed-check").is(':checked');
    getRankings(path, numTeams, isReversed)
    .then((data) => {
        console.log(data);
        var table = `<div><table class="table table-striped">
                        <thead>
                            <tr>
                            <th scope="col">#</th>
                            <th scope="col">Team</th>
                            <th scope="col">Value</th>
                            </tr>
                        </thead><tbody>`
        var i = 1;
        for(info of data)
        {
            var color = ""
            for(style of highlightedTeams)
                if(style[0] == info[0])
                    color = style[1];
            
            table += `    <tr style = "background-color: ${color}">
                        <th scope="row">${i}</th>
                        <td>${info[0]}</td>
                        <td>${info[1]}</td>
                        </tr>`
            i ++;
        }
        table += `</tbody></table></div>`
        $("#rankings").before(makeTableCard(choice, table));
    })
}

function makeTableCard(choice, table)
{
  return ` <div class="card col-md-4">
        <div class="card-header">
            <h4 class="text-center">${choice}</h4>
        </div>
        <div class=" text-center">
            ${table}
            <div data-choice = "${choice}" class="btn btn-danger delete-button mb-3">Delete Card</div>
        </div>
    </div>`
}

function capitalize(str)
{
    return str.charAt(0).toUpperCase() + str.slice(1);
}