var currentEventKey;
document.addEventListener("DOMContentLoaded", event => {
    $("#loading-options").hide();
    $(".fa-check").each(function() {
        $(this).hide();
    })
    $('#create-event-btn').on("click", function() {
        var event = $('#event-id').val();
        if(event.length == 0)
            return;
        initalizeEvent(event);
    })
})

//Possinly do "Set current event" first, and then have server getCurrentEvent for each set up
// function, so you don't have to pass it in each time.

function initalizeEvent(eventKey) {
    $("#loading-options").show();
    currentEventKey = eventKey
    setBlueAllianceData("event/" + eventKey + "/simple", filterEvent, createEvent)
    setBlueAllianceData("event/" + eventKey + "/matches/simple", filterMatches, createMatchesInEvent)
    setBlueAllianceData("event/" + eventKey + "/teams/simple", filterTeams, createTeamsInEvent)
    setCurrentEvent(eventKey);
}

function createEvent(eventData)
{
    console.log("Creating Event")
    $.post("/createEvent", {"eventData": eventData, "key":currentEventKey }, function(data, status) {
        if (status != "success")
            $("#error").text($("#error").text() + " Error in creating Event")
        else
            $("#event-check").show();
    });
}

function createMatchesInEvent(matchData, key)
{
    console.log("Creating Matches")
    $.post("/createMatchesInEvent", { "matchData": matchData, "key": currentEventKey },function (data, status) {
        if (status != "success")
            $("#error").text($("#error").text() + " Error in creating Match")
        else
            $("#matches-check").show();
    })
}

function createTeamsInEvent(teamData, key)
{
    console.log("Creating Teams");
    $.post("/createTeamsInEvent", { "teamData": teamData, "key": currentEventKey }, function (data, status) {
        if (status != "success")
            $("#error").text($("#error").text() + " Error in creating Teams")
        else
            $("#teams-check").show();
    })
}
function setCurrentEvent(eventKey) { 
    $.post("/setCurrentEvent", { "key": eventKey});
}

function filterMatches(response)
{
    var matches = {};
    for (match of response) {
        if (match.comp_level != "qm")
            continue;
        var matchData = {};
        for (color in match.alliances) {
            var alliance = [];
            for (team of match.alliances[color].team_keys)
                alliance.push(team.substring(3));
            matchData[color] = alliance;
        }
        matches[match.match_number] = matchData;
    }
    return matches;
}

function filterTeams(response) {
    var teams = [];
    for (team of response) 
        teams.push(team["team_number"]);
    return teams
}

function filterEvent(response)
{
    return { "key": response.key, "name": response.name};
}

function setBlueAllianceData(urlSuffix, filter, send) {
    $.get('/getBlueAllianceKey')
        .then(key => {
            $.ajax({
                url: "https://www.thebluealliance.com/api/v3/" + urlSuffix,
                headers: {
                    'X-TBA-Auth-Key': key
                },
                method: 'GET',
            })
                .then((response) => {
                   return filter(response);
                })
                .then((filteredData) =>{
                    if(send)
                        send(filteredData);
                })
                .catch(err => {
                    console.log("Error");
                    console.log(err);
                    $("#error").text($("#error").text() + "  " + err.responseText);
                })
        })
}