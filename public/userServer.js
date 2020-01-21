async function getCurrentEvent()
{
  return  $.get('/getCurrentEvent', (event) => {
        return event;
    })
}

async function getMatches() {
    return $.get('/getMatches', (matches) => {
        return matches;
    })
}

async function getTeamsInMatch(match) {
    
    return $.get('/getTeamsInMatch?match=' + match, (teams) => {
        return teams;
    })
   
}

async function getEmptyMatchData() {
   return $.get('/getEmptyData', (emptyData) => {
        return emptyData;
    })
}

async function getRankings(path, numTeams, isReversed)
{
    console.log("Is reversed: " + isReversed);
    return $.get('/getRanking?path=' + path + '&numTeams=' + numTeams + "&isReversed=" + isReversed, (data) => {
        return data;
    })
}

function saveData()
{
    getInputtedData()
    .then((data) => {
        $.post('/saveData', data);
        reset();
        $("#main").hide();
    })
}