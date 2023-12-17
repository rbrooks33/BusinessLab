Apps.Define([], function () {
    var Me = {
        Email: null,
        LoginStep: 1,
        CallerCallback: null,
        Initialize: function (callback) {
            callback();
        },
        Show: function (callerCallback) {

            Me.CallerCallback = callerCallback;
            Me.UI.Templates.Auth_Passwordless.Show();

            //Fire button on enter
            let emailInput = $('#Auth_Passwordless_Email')[0];

            emailInput.addEventListener("keypress", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    Apps.Components.Auth.Passwordless.SendEmail();
                }
            });
        },
        SendEmail: function () {

            let result = new Apps.Result();
            let post = Apps.Components.Main.Main;

            $('#Auth_Passwordless_Email').focus();

            if (Me.LoginStep == 1) {
                //Initial email

                Me.Email = $('#Auth_Passwordless_Email').val();

                $('#Auth_Passwordless_Email').val(''); //clear email

                let args = {
                    Method: "SignIn",
                    Email: Me.Email
                };

                post.Refresh(args, [], function () {

                    if (post.Success) {

                        //Change prompt to prompt for Passcode
                        $('#Auth_Passwordless_EmailLabel').text('Enter Emailed Passcode');
                        $('#Auth_Passwordless_ButtonLabel').text('Verify');

                        Me.LoginStep = 2;

                        result.AddSuccess('sign in success');

                        //Check if code 1 (new user) or code 2 (existing user)
                        let codes = Enumerable.From(post.Result.Codes).Where(function (c) { return c.ID == 1 || c.ID == 2; }).ToArray();
                        if (codes.length == 1) {

                            result.AddSuccess('code returned: ' + codes[0].ID);

                            let code = codes[0].ID;

                            if (code == 2) {
                                //New user
                                Apps.Notify('success', 'Congratulations! Your new account using email ' + Me.Email + ' was created! Now we just need to verify your passcode to get started!');

                            }
                            else if (code == 1) {
                                //Existing user
                                Apps.Notify('success', 'Welcome back! Verify your passcode to get started.')

                            }
                            else
                                result.AddFail('no code value');

                        }
                        else {

                        }
                    }
                    else
                        Apps.Components.Main.HandleError(post.Result);

                });
            }
            else if (Me.LoginStep == 2) {

                //Validate passcode
                let passcode = $('#Auth_Passwordless_Email').val();

                let args = {
                    Method: 'VerifyPasscode',
                    Passcode: passcode,
                    Email: Me.Email
                };

                post.Refresh(args, [], function () {

                    if (post.Success) {

                        //Verified passcode, save token
                        Apps.SaveAuthenticationData(post.Data);

                        //Populate user
                        Me.GetTokenUser(function (user) {

                            if (user.IsSignedIn)
                                Me.CallerCallback(true);
                            else
                                Apps.Notify('warning', 'Unable to sign in user. Please try again.');
                        });
                    }
                    else {

                        //Not the right passcode
                        Apps.Notify('warning', 'Unable to verify passcode. Please try again.');

                        //Change prompt back to to prompt for Email
                        Me.LoginStep = 1;

                        $('#Auth_Passwordless_EmailLabel').text('Email');
                        $('#Auth_Passwordless_ButtonLabel').text('Send');
                    }
                });
            }
        },
        GetTokenUser: function (callback) {

            let user = Apps.Components.Auth.User;
            let post = Apps.Components.Main.Main;
            let token = Apps.GetAuthenticationData();

            user.IsSignedIn = false;

            if (token) {
                let args = {
                    Method: "GetTokenUser",
                    Token: token
                }

                post.Refresh(args, [], function () {

                    if (post.Success) {
                        if (post.Data) {

                            //Token valid, populate user
                            user.IsSignedIn = true;
                            user.Email = post.Data[0].Email;
                            user.UserID = post.Data[0].UserID;
                        }
                        callback(user);
                    }
                    else {
                        Apps.Components.Main.HandleError(post.Result);
                    }
                });
            }
            else
                callback(user);
        },
        Hide: function () {
            Me.UI.Templates.Auth_Passwordless.Hide();
        },
        SignOut: function () {
            Apps.SaveAuthenticationData('');
            location.href = '';
        }
    };
    return Me;
});