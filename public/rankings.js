document.addEventListener("DOMContentLoaded", event => {
    getOptions();
    $("#ranking-num-teams-group").hide();

    $("#num-teams-check").on("click", function() {
        $(this).is(':checked') ? $("#ranking-num-teams-group").hide() : $("#ranking-num-teams-group").show();
    })

    $("#get-btn").on("click", setRankedTable)
    $(document).on("click", ".delete-button", function() {
        $("#ranking-select").append(`<option>${$(this).attr('data-choice')}</option>`)
        $(this).parent().parent().remove();
    })
})

function getOptions()
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
            table += `    <tr>
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