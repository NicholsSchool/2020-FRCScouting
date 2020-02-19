var charts = [];
document.addEventListener("DOMContentLoaded", event => {
    $("#charts").hide();
    setUp();
    $("#team-select-btn").on("click", () => {
        setUpTeamDataCharts($("#team-select option:selected").text());
    })
})

function setUp()
{
    getAllTeams()
        .then(teams => {
            $("#team-select").each(function () {
                for (team of teams)
                    $(this).append(`<option>${team}</option>`);
            })
            return;
        })
        .then(() => {
            var url =  $(location).attr('href')
            if(!url.includes('?'))
                return;
            var team = url.substring(url.indexOf("=") + 1, url.length)
            console.log(team);
            $("#team-select").val(team);
            setUpTeamDataCharts(team);
        })
}

function setUpTeamDataCharts(team)
{
    clearCharts();
   getTeamData(team)
   .then(teamData => {
       var teamMatchData = teamData["matches"]
  
       $("canvas").each(function () {
           var path = $(this).attr('id').split("-");
           var data = [];
           var labels = [];
           for(index in teamMatchData) {
               labels.push("" + index);
                var temp = teamMatchData[index];
                for (var i = 0; i < path.length; i++)
                    temp = temp[path[i]];
                data.push(temp)
           }
           createChart($(this), data, $(this).attr('id'), labels);
       })
       $("#charts").show();
   })
}

function createChart(ctx, data, id, labels)
{
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: id,
                data: data,
                borderColor: [
                    'rgb(86, 229, 86)',
                ],
                fill: false
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                    }
                }],
                xAxes: [{
                    ticks: {
                        max: data.length
                    }
                }]
            }
        }
    });
    charts.push(myChart);
    console.log(data.length);
}

function clearCharts()
{
    for(chart of charts)
        chart.destroy();
    charts = [];
}