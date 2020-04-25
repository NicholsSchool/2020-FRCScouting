const { app, db } = require('./server');

/**
 * Used to create an event in the firebase storage
 * 
 * @param eventData - inside the request sent, this must contain the event's key and name
 */
app.post("/createEvent", (req, res) => {
    var event = req.body.eventData;
    db.collection("Events").doc(event.key).set({
        "name": event.name
    })
        .then(() => {
            res.send("all done");
        })
})

/**
 * Used to create matches within an event in the firebase storage
 * 
 * @param matchData - inside the request sent, this must contain all the matches in the event 
 *                    and the alliances within each match 
 * @param key - inside the request sent, this must contain the event key 
 */
app.post("/createMatchesInEvent", (req, res) => {
    var matches = req.body.matchData;
    var eventKey = req.body.key;
    var batch = db.batch();
    for (match in matches) {
        var matchNum = "" + (Number(match) + 1);
        while (matchNum.length < 3)
            matchNum = "0" + matchNum;
        batch.set(db.collection("Events").doc(eventKey).collection("Matches").doc(matchNum), matches[match]);
    }
    batch.commit()
        .then(() => {
            res.send("done");
        })
})

/**
 * Used to create and setup storage for each team in the event
 * 
 * @param teamData - inside the request sent, this must contain a list of all teams in the event
 * @param key - inside the request sent, this must contain the event key
 */
app.post("/createTeamsInEvent", (req, res) => {
    var teams = req.body.teamData;
    var eventKey = req.body.key;
    var batch = db.batch();
    for (team of teams)
        batch.set(db.collection("Events").doc(eventKey).collection("Teams").doc(team), {
            teamNum: team,
            matches: {},
            averages: getEmptyMatchData().gamePlay
        });
    batch.commit().then(() => {
        res.send("done");
    })

})

/**
 * Sets the app's current event to the given event
 * 
 * @param key - inside the request sent, this must contain the event key
 */
app.post("/setCurrentEvent", (req, res) => {
    //Possibly add code to confirm that the event inputted exists in current Event.
    db.collection("MetaData").doc("CurrentEvent").set({ "event": req.body.key });
})
