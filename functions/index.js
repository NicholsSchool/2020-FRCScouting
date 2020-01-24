const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
const express = require('express')
const app = express()

//Firebase realtime database
const db = admin.firestore();

const blueAllianceAuth = functions.config().bluealliance.authkey;

app.post("/createEvent", (req, res) => {
    var event = req.body.eventData;
    db.collection("Events").doc(event.key).set({
        "name": event.name
    })
    .then(()=>{
        res.send("all done");
    })
})

app.post("/createMatchesInEvent", (req, res) => {
    var matches = req.body.matchData;
    var eventKey = req.body.key;
    var batch = db.batch();
    for(match in matches)
    {
        var matchNum = "" + (Number(match) + 1);
        while(matchNum.length < 3)
            matchNum = "0" + matchNum;
        batch.set(db.collection("Events").doc(eventKey).collection("Matches").doc(matchNum), matches[match]);
    }
    batch.commit()
    .then(() => {
        res.send("done");
    })
   
    
})

app.post("/createTeamsInEvent", (req, res) => {
    var teams = req.body.teamData;
    var eventKey = req.body.key;
    var batch = db.batch();
    for(team of teams)
        batch.set(db.collection("Events").doc(eventKey).collection("Teams").doc(team), {
            teamNum: team,
            matches : [],
            averages : getEmptyMatchData().gamePlay
        });
    batch.commit().then(() =>{
        res.send("done");
    })
   
})

app.post("/setCurrentEvent", (req, res) => {
    //Possibly add code to confirm that the event inputted exists in current Event.
    db.collection("MetaData").doc("CurrentEvent").set({"event" : req.body.key});
})

app.get("/getBlueAllianceKey", (req, res) =>{
   res.send(blueAllianceAuth);
})

app.get("/getCurrentEvent", (req, res) =>{
    getCurrentEvent()
    .then((event) =>{
       return db.collection("Events").doc(event).get();
    })
    .then((snap) => {
        res.send(snap.data().name);
    })
    .catch((err) => {
        console.error(err);
    })
})

app.get("/getMatches", (req, res) => {
    getCurrentEvent()
    .then((event) => {
       return db.collection("Events").doc(event).collection("Matches").listDocuments()
    })
    .then(docs => {
        var matches = [];
        for(match of docs)
            matches.push(match.id);
        res.send(matches);
    })
    .catch(err => {
        console.error(err);
    })
})

app.get("/getAllTeams", (req, res) => {
    getCurrentEvent()
    .then((event) => {
        return db.collection("Events").doc(event).collection("Teams").listDocuments()
    })
    .then(docs => {
        var teams = [];
        for(team of docs)
            teams.push(team.id);
        res.send(teams);
    })
})


app.get("/getTeamsInMatch", (req, res) => {
    var match = req.query.match;
    getCurrentEvent()
    .then((event) => {
        return db.collection("Events").doc(event).collection("Matches").doc(match).get()
    })
    .then((match) => {
        res.send(match.data());
    })
    .catch((err) => {
        console.error(err);
    })
})

app.get('/getEmptyData', (req, res) => {
    res.send(getEmptyMatchData());
})

function getEmptyMatchData()
{
    return {
        match: "",
        team: "",
        gamePlay: {
            auto: {
                "line": 0,
                "high": 0,
                "low": 0,
                "score": 0,
            },
            teleop: {
                "high": 0,
                "low": 0,
                "rotation": 0,
                "position": 0,
                "score": 0
            },
            end: {
                "climb": 0,
                "balance": 0,
                "park": 0,
                "score": 0
            },
            totalScore: 0
        }
    }
    
}

function getDataPointValues()
{
    return {
        auto: {
            "line": 5,
            "high": 4,
            "low": 2,
        },
        teleop: {
            "high": 2,
            "low": 1,
            "rotation": 10,
            "position": 20,
        },
        end: {
            "climb": 25,
            "balance": 15,
            "park" : 5,
        }
    }
}

function getDependentData()
{
    return {
        "teleop": {
            "rotation": 0,
            "position": 0
        }
    }
}

app.post("/saveData", (req, res) => {
    var data = req.body;
    getCurrentEvent()
    .then((event) => {
        let teamRef = db.collection("Events").doc(event).collection("Teams").doc(data.team);
        db.runTransaction((transaction) => {
           return transaction.get(teamRef)
            .then(teamDoc => {
               var teamData = teamDoc.data();
               var gamePlay = convertToProperData(data.gamePlay);
               console.log(teamData);
               teamData.matches.push(gamePlay);
               var newAverages = updateAverages(teamData.averages, gamePlay, teamData.matches.length);
               transaction.update(teamRef, {matches: teamData.matches, averages: newAverages});
            })
        })
        .then((result) => {
            res.send("done");
        })
        .catch((err) => {
            console.error(err);
        })
    })
})

function convertToProperData(jsonData)
{
    var pointValues = getDataPointValues();
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

app.get("/getRanking", (req, res) => {
    var path = req.query.path;
    var numTeams = Number(req.query.numTeams);
    var order = req.query.isReversed == "true" ? 'asc' : "desc";
    getCurrentEvent()
    .then((event) => {
        if(numTeams <= 0)
            return db.collection("Events").doc(event).collection("Teams").orderBy(path, order).get();
        else
            return db.collection("Events").doc(event).collection("Teams").orderBy(path, order).limit(numTeams).get();
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
})

function calculateAllianceScore(allianceAverages)
{
    var points = getDataPointValues(); // Also used for looping through
    var dependentData = getDependentData();
    var allianceScore = 0;
    for(gamePeriod in points)
    {
        for (teamAverage of allianceAverages)
        {
            //Adding average total score is unreliable because some tasks only require 1 out of 3 teams
            if (gamePeriod == "totalScore") 
                continue;
            //If everything in this period is independent, just add the average score
            if( !(gamePeriod in dependentData))
            {
                allianceScore += teamAverage[gamePeriod].score;
                continue;
            }

            for (action in teamAverage[gamePeriod])
            {
                if(action == "score")
                    continue;
                
                //If this action is not a dependent action, then just add it to the score
                console.log("A Testing Action: " + action + " in " + gamePeriod)
                console.log(dependentData[gamePeriod])
                if (!(action in dependentData[gamePeriod]))
                    allianceScore += teamAverage[gamePeriod][action] * points[gamePeriod][action];
                else
                    if(dependentData[gamePeriod][action] <= teamAverage[gamePeriod][action])
                        dependentData[gamePeriod][action] = teamAverage[gamePeriod][action];
            }
        }
    }

    for(gamePeriod in dependentData)
        for(action in dependentData[gamePeriod])
        {
            console.log("Dependent Action: " + action + " in " + gamePeriod + " Final Val: " + dependentData[gamePeriod][action]);
            allianceScore += dependentData[gamePeriod][action] * points[gamePeriod][action];
        }
        
    return allianceScore

}

function getAllianceScore(allianceSnap){
    var allianceAverages = []
    allianceSnap.forEach(team => {
        allianceAverages.push(team.data().averages);
    })
    return calculateAllianceScore(allianceAverages);
}

app.get("/getWinner", (req, res) => {
    var blueAlliance = req.query.blue;
    var redAlliance = req.query.red;
    var blueScore = 0;
    var redScore = 0;
    var teamsRef;
    getCurrentEvent()
    .then((event) => {
        teamsRef = db.collection("Events").doc(event).collection("Teams");
        return teamsRef.where('teamNum', 'in', blueAlliance ).get();
    })
    .then((alliance) => {
        blueScore = getAllianceScore(alliance);
        return teamsRef.where('teamNum', 'in', redAlliance).get();
    })
    .then((alliance) => {
        redScore = getAllianceScore(alliance);
        res.send({"blue": blueScore, "red": redScore});
    })
    .catch((err) => {
        console.log(err);
        res.send(err);
    })
    
})


//One improvement I think could be made to this method is returning the doc,
// db.collection("Events").doc(event), rather than just the string name of it
async function getCurrentEvent(){

    return db.collection("MetaData").doc("CurrentEvent").get()
        .then(snap => {
            return snap.data().event;
        })
}

exports.app = functions.https.onRequest(app);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
