var charts = {};

document.addEventListener("DOMContentLoaded", event => {
    $("#charts").hide();
    setUp();
    $("#team-select-btn").on("click", () => {
        clearCharts();
        setUpTeamDataCharts($("#team-select-1 option:selected").text(), createChart);
    })
    $("#second-team-select-btn").on("click", () => {
        //if charts is empty, don't make second chart
        if (Object.entries(charts).length === 0)
            $("#second-team-select-error").show();
        else{
            $("#second-team-select-error").hide();
            setUpTeamDataCharts($("#team-select-2 option:selected").text(), addSecondDataset);
        }
    })
})

function setUp()
{
    getAllTeams()
        .then(teams => {
            $(".team-select").each(function () {
                for (team of teams)
                    $(this).append(`<option>${team}</option>`);
            })
            return;
        })
        .then(() => {
            var url =  $(location).attr('href')
            if(!url.includes('?'))
                return;
            var team = url.substring(url.indexOf("=") + 1, url.length);
            $("#team-select-1").val(team);
            clearCharts();
            setUpTeamDataCharts(team, createChart);
        })
}

function setUpTeamDataCharts(team, typeOfChart)
{
    
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
           typeOfChart($(this), data, $(this).attr('id'), labels, team);
       })
       $("#charts").show();
   })
}

function createChart(ctx, data, id, labels, teamNum )
{
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: teamNum,
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
    charts[id] = myChart;
}


function addSecondDataset(ctx, data, id, labels, teamNum)
{
    var dataset = {
        label: teamNum,
        data: data,
        borderColor: [
            'rgb(204, 0, 153)',
        ],
        fill: false
    }
    if(charts[id].data.datasets.length == 1)
        charts[id].data.datasets.push(dataset)
    else 
        charts[id].data.datasets[1] = dataset
    charts[id].update();
}

function clearCharts()
{
    for(id in charts)
        charts[id].destroy();
    charts = {};
}