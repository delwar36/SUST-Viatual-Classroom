
function onSignIn(googleUser)
{
    let profile = googleUser.getBasicProfile();
    $(".g-signin2").css('display', 'none');
    $(".data").css('display', 'block');
    $("#picture").attr('src', profile.getImageUrl());
    $("#email").text(profile.getEmail());
}

function signOut()
{
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function ()
    {
        alert("You have been sign out");
        $(".g-signin2").css('display', 'block');
        $(".data").css('display', 'none');
    });
}

function renderButton()
{
    gapi.signin2.render('g-signin2', {
        'scope': 'profile email',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'background': 'red'
    });
}
