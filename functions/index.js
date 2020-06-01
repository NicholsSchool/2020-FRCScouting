
const { app, db, functions } = require('./server');
require("./setup");
const retrieval = require("./retrieval");
const gameData = require("./data");
const verification = require("./verification");
require("./predictions");

const blueAllianceAuth = functions.config().bluealliance.authkey;

/**
 * Returns the blue alliance auth key
 * @return the blue alliance auth key
 */
app.get("/getBlueAllianceKey", (req, res) => {
    verification.verifyAuthToken(req)
    .then(decoded => {
        res.send(blueAllianceAuth);
    })
    .catch(err => {
        console.log(err);
        res.status(401).send("Must be signed in to access blue alliance auth key");
    })
  
})

/**
 * Saves the scoutted data and updates the firebase database
 * 
 * @param data - inside the request sent, this must be the match data storage objected filled with scouted data
 */
app.post("/saveData", (req, res) => {
    var data = req.body;
    verification.verifyAuthToken(req)
    .then((decoded) => {
        return retrieval.getCurrentEvent()
    })
    .then((event) => {
        let teamRef = event.collection("Teams").doc(data.team);
        return db.runTransaction((transaction) => {
            return transaction.get(teamRef)
                .then(teamDoc => {
                    var teamData = teamDoc.data();
                    if (teamData.matches.hasOwnProperty(data.match)) {
                        console.log("Match " + data.match + " for team " + data.team + " Already scouted")
                        return
                    }
                    var gamePlay = convertToProperData(data.gamePlay);
                    teamData.matches[data.match] = gamePlay;
                    var newAverages = updateAverages(teamData.averages, gamePlay, Object.keys(teamData.matches).length);
                    transaction.update(teamRef, { matches: teamData.matches, averages: newAverages });
                })
        })
    })
    .then((result) => {
        res.send("done");
    })
    .catch((err) => {
        console.error(err);
        res.status(400).send("Error saving data");
    })

})


/**
 * Converts the given match data storage object filled with scoutted data from being filled 
 * with strings to being filled with the numeric values of those strings. 
 * 
 * @param {*} jsonData - a match data storage object filled with scoutted data 
 */
function convertToProperData(jsonData)
{
    var pointValues = gameData.getDataPointValues();
    jsonData.totalScore = 0;
    for(gamePeriod in jsonData)
    {
        if(gamePeriod == "totalScore")
            continue;
        jsonData[gamePeriod].score = 0
        for(action in jsonData[gamePeriod])
        {
            if(action == "score")
                continue;
            jsonData[gamePeriod][action] = Number(jsonData[gamePeriod][action]);
            jsonData[gamePeriod].score += jsonData[gamePeriod][action] * pointValues[gamePeriod][action];
        }
        jsonData.totalScore += jsonData[gamePeriod].score;
    }
    return jsonData;
}

/**
 * Update's a teams averages with the new scoutted data 
 * @param {*} averages - the current averages 
 * @param {*} newData - the new scoutted data
 * @param {*} num - the amount of matches now scoutted for the team 
 */
function updateAverages(averages, newData, num)
{
    if(num == 1)
        return newData;

    for(gamePeriod in averages)
        for(score in averages[gamePeriod])
        {
            var val = averages[gamePeriod][score] * (num - 1);
            val += Number(newData[gamePeriod][score]);
            averages[gamePeriod][score] = val/num;
        }
    var val = averages.totalScore * (num - 1) + Number(newData.totalScore);
    averages.totalScore = val/num;
    return averages;
}

/**
 * Returns a ranked list of teams and their average score for a given task
 * 
 * @param path - inside the request sent, this must be the path to where the task is stored
 * @param numTeams - inside the request sent, this must be how many teams in the ranked list are desired
 * @param isReversed - inside the request sent, this must be true for reversed, false otherwise
 * @return a ranked list of teams and their average score for a given task
 */
app.get("/getRanking", (req, res) => {
    var path = req.query.path;
    var numTeams = Number(req.query.numTeams);
    var order = req.query.isReversed == "true" ? 'asc' : "desc";
    
    verification.verifyAuthToken(req)
    .then((decoded) => {
        return retrieval.getCurrentEvent()
    })
    .then((event) => {
        if(numTeams <= 0)
            return event.collection("Teams").orderBy(path, order).get();
        else
            return event.collection("Teams").orderBy(path, order).limit(numTeams).get();
    })
    .then((snap) => {
        var data = [];
        path = path.split(".");
        snap.forEach(doc => {
            var value = doc.data();
            for (i = 0; i < path.length; i++)
                value = value[path[i]];
            data.push([doc.id, value]);
        });
        res.send(data);
    })
    .catch(err => {
        res.status(400).send("Error in getting ranking");
    })
})

exports.app = functions.https.onRequest(app);