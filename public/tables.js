var teamData = [];
var highlightedTeams = [];
document.addEventListener("DOMContentLoaded", event => {
    setUpHighlightOptions();
    getHeaderOptions();
    $(document).on("click", "th", function () {
        reorganizeChart(Number($(this).attr("data-sort")));
    })
    $("#highlight-btn").on("click", () => {
        var team = $("#highlight-team option:selected").text();
        $("#highlight-team option:selected").remove();
        if (team.length > 6)
            return;
        var style = [team, $("#highlight-color").val()];
        highlightedTeams.push(style)
        $("tr").each(function () {
            if ($(this).children().eq(1).text().trim() == team)
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
    $(document).on("click", ".delete-highlight", function () {
        var team = $(this).attr('data-team');
        $("tr").each(function () {
            if ($(this).children().eq(1).text().trim() == team)
                $(this).css("background-color", "");
        })
        for (i in highlightedTeams)
            if (highlightedTeams[i][0] == team)
                highlightedTeams.splice(i, 1);
        $("#highlight-team").append(`<option>${team}</option>`);
        $(this).parent().parent().remove();
    })

    $("#rankings-btn").on("click", () => {
        var paths = [];
        $(".data").each(function(index, value) {
            if ($(this).is(':checked'))
                paths.push($(this).attr('id'));
        })
        setUpTable(paths);
    })
})

function setUpHighlightOptions()
{
    getAllTeams()
        .then((teams) => {
            for (team of teams)
                $("#highlight-team").append(`<option>${team}</option>`);
        })
}

function setUpTable(paths) {
    getAllTeamsData()
    .then(snap => {
        setUpTableHeaders(["#", "Team"].concat(paths));
        var index = 1;
        snap.forEach(doc => {
            var info = [doc.id];
            for(path of paths)
            {
                path = path.split(" ");
                var value = doc.data()["averages"];
                for (i = 0; i < path.length; i++)
                    value = value[path[i]];
                info.push(Math.round(value * 1000)/1000);
            }
            teamData.push(info);
            setUpRow([index++].concat(info));
        }); 
        $("#ranking-options").hide();
    })
}

function getHeaderOptions() 
{
    getEmptyMatchData()
    .then(sampleData => {
        sampleData = sampleData.gamePlay;
        var options = [];
        for (gamePeriod in sampleData)
            for (score in sampleData[gamePeriod])
                options.push(gamePeriod + " " + score);
        options.push("totalScore");
        setUpHeaderOptions(options);
    })
   
}

function setUpHeaderOptions(options)
{
    for(option of options)
    {
        $("#header-options").append(` <div class="col-2 my-2 form-check">
                            <input class="form-check-input data" type="checkbox" id="${option}">
                            <label class="form-check-label" for="${option}">
                                ${option}
                            </label>
                        </div>`);
    }
}

function setUpTableHeaders(headers)
{
    console.log(headers);
    var index = 0;
    for(header of headers)
        $("#table-headers").append(`<th data-sort = "${index ++}"scope="col">${header}</th>`)
    
}

function setUpRow(info)
{
    var color = "";
    for (style of highlightedTeams)
        if (style[0] == info[1])
            color = style[1];

    var row = `<tr style = "background-color: ${color}"><th scope = "row">${info[0]}</th>`
    for(var i = 1; i < info.length; i++)
        row += `<td>${info[i]}</td>`
    row += `</tr>`
    $("#table-body").append(row)
}

async function getAllTeamsData()
{
    var order = 'desc';
    var path = "averages.totalScore"
    return getCurrentEventID()
        .then(eventID => {
            return db.collection("Events").doc(eventID).collection("Teams").orderBy(path, order).get();
        })
}

function reorganizeChart(index)
{
    if(index - 1 < 0)
        return;
    index -= 1;
    $("#table-body").empty();
    sort(index)
    var num = 1;
    for(info of teamData)
        setUpRow([num++].concat(info));
}

function sort(sortIndex)
{
    teamData.sort(function(a, b){
        return b[sortIndex] - a[sortIndex];
    })
}