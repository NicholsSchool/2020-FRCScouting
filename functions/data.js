var methods = {};

/**
 * Returns an empty match data storage object
 * 
 * @return an empty match data storage object
 */
methods.getEmptyMatchData = function(){
    return {
        match: "",
        team: "",
        gamePlay: {
            auto: {
                "line": 0,
                "threes": 0,
                "twos": 0,
                "ones": 0,
                "score": 0,
            },
            teleop: {
                "threes": 0,
                "twos": 0,
                "ones": 0,
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
            performance: {
                "defense": 0,
                "no_show": 0,
            },
            totalScore: 0
        }
    }

}

/**
 * Returns an object containing the point values for each task being scouted
 * 
 * @return an object containing the point values for each task being scouted
 */
methods.getDataPointValues = function() {
    return {
        auto: {
            "line": 5,
            "threes": 6,
            "twos": 4,
            "ones": 2,
        },
        teleop: {
            "threes": 3,
            "twos": 2,
            "ones": 1,
            "rotation": 10,
            "position": 20,
        },
        end: {
            "climb": 25,
            "balance": 15,
            "park": 5,
        },
        performance: {
            "defense": 0,
            "no_show": 0,
        }
    }
}

/**
 * Returns an object containing each task which only one team can accomplish per match
 * 
 * @return an object containing each task which only one team can accomplish per match
 */
methods.getDependentData = function() {
    return {
        "teleop": {
            "rotation": 0,
            "position": 0
        }
    }
}

module.exports = methods;