var teamData = [];
document.addEventListener("DOMContentLoaded", event => {
    setUpTable();
    $(document).on("click", "th", function () {
        reorganizeChart(Number($(this).attr("data-sort")));
    })
})

function setUpTable() {
    getAllTeamsData()
    .then(snap => {
        var paths = [];
        var sampleData = snap.docs[0].data()["averages"];
        for(gamePeriod in sampleData)
            for(score in sampleData[gamePeriod])
                paths.push(gamePeriod + " " + score);
        paths.push("totalScore");
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
    })
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
    var row = `<tr><th scope = "row">${info[0]}</th>`
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