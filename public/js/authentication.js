
document.addEventListener("DOMContentLoaded", event => {    
    $("#content").hide();
    
    $(document).on("click", "#signIn", () => {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithRedirect(provider)
            firebase.auth().getRedirectResult().then(function (result) {
                if (result.credential) {
                    // This gives you a Google Access Token. You can use it to access the Google API.
                    var token = result.credential.accessToken;
                    // ...
                }
                // The signed-in user info.
                var user = result.user;
            }).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                // ...
            });
        })
        .catch( (error) => {
                console.error(error)
        });
    })

    $(document).on("click", "#signOut", () => {
        
        firebase.auth().signOut()
            .catch(function (error) {
                console.log(error);
            });
    })

    firebase.auth().onAuthStateChanged(user => {
        console.log(user)
        if(user)
            signInResponse()
        else 
            signOutResponse();
    })

})

function signInResponse() {
    console.log("Signed in")
    $("#content").show();
    $("#warning").hide();
    $("#signIn").hide();
    $("#signOut").show();
}

function signOutResponse()
{
    console.log("Signed out")
    $("#content").hide();
    if ($("#warning").length == 0) 
        $("#content").before(
            `<h1 id = "warning" class = "text-center mt-3"> You must sign in to be able to use the app </h1>`);
    else    
        $("#warning").show();

    $("#signIn").show();
    $("#signOut").hide();
}

