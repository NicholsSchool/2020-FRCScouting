var queries = {};

async function getCurrentEventID() {
    return $.get('/getCurrentEventID', (eventID) => {
        return eventID;
    })
}

async function getUpdatableRankings(path, numTeams, isReversed, choice){
    var order = isReversed == true ? 'asc' : "desc";
    numTeams = Number(numTeams);
    getCurrentEventID()
    .then(eventID => {
        var query;
        if (numTeams <= 0)
            return db.collection("Events").doc(eventID).collection("Teams").orderBy(path, order);
        else
           return db.collection("Events").doc(eventID).collection("Teams").orderBy(path, order).limit(numTeams);
    })
    .then(query => {
        path = path.split(".").join("-");
        query =   query
            .onSnapshot(function (snap) {
                var data = [];
                var p = path.split("-");
                snap.forEach(doc => {
                    var value = doc.data();
                    for (i = 0; i < p.length; i++)
                        value = value[p[i]];
                    data.push([doc.id, value]);
                });
                if ($('#' + path).length == 0)
                {
                    console.log("Set Up")
                    var table = makeTable(data, path)
                    $("#rankings").before(makeTableCard(choice, table));
                }
                else
                {
                    console.log("Update");
                    var newTable = makeTable(data, path)
                    $('#' + path).replaceWith(newTable);
                }
            })
        queries[path] = query;
        return query;

    })   
    
}