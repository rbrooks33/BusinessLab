﻿Apps.Define([], function () {
    var Me = {
        MSAL: {},
        Email: '',
        FullName: '',
        User: null,
        SignedIn: false,
        Initialize: function (callback) {


            if (callback)
                callback();

        },
        Show: function () {

            Me.UI.Templates.Auth_Microsoft_LoginButton.Show();

            try {
                Me.MSAL = new msal.PublicClientApplication(Me.MSALConfig);

                Me.UI.Show();

                $('#Auth_SignIn_Button').text("Sign In");

                Me.CheckSignIn(function (signedin) {
                    Me.SignedIn = signedin;
                    console.info('Signed in: ' + signedin);
                });
            }
            catch (err) {
                //do nothing
            }
        },
        IsSignedIn: false,
        SignInUsername: '',
        CheckSignIn: function (callback) {

            if (Me.MSAL.getAllAccounts) {
                const currentAccounts = Me.MSAL.getAllAccounts();
                if (currentAccounts.length === 0) {
                    //Apps.SaveAuthenticationData('');
                    //return;
                    Me.IsSignedIn = false;
                    Me.RefreshButton();
                    callback(false);
                } else if (currentAccounts.length > 1) {
                    // Add choose account code here
                    //console.warn("Multiple accounts detected.");
                    Me.IsSignedIn = false;
                    Me.RefreshButton();
                    callback(false);
                } else if (currentAccounts.length === 1) {

                    Me.IsSignedIn = true;
                    Me.User = currentAccounts[0];
                    Me.Email = currentAccounts[0].username;
                    Me.FullName = currentAccounts[0].name;
                    Me.OfficeID = currentAccounts[0].localAccountId
                    Me.RefreshButton();
                    callback(true);
                }
            }
            else
                Apps.Notify('warning', 'MSAL not populated.');
        },
        RefreshButton: function () {
            if (Me.IsSignedIn) {
                $('#Auth_SignIn_Button').text("Sign Out");
                $('#Auth_SignIn_Button').addClass('btn-success').removeClass('btn-secondary');
            }
            else {
                $('#Auth_SignIn_Button').text("Sign In");
                $('#Auth_SignIn_Button').addClass('btn-secondary').removeClass('btn-success');
            }
        },
        SignIn: function () {

            if (Me.IsSignedIn) {

                Me.SignOut();
            }
            else {

                Me.MSAL.loginPopup({ scopes: ["User.Read"] })
                    .then(tokenResponse => {

                        Apps.SaveAuthenticationData(tokenResponse.accessToken);
                        Me.IsSignedIn = true;
                        Me.SignInUsername = tokenResponse.account.username;

                        Me.RefreshButton();

                        location.reload();

                    }).catch(error => {
                        console.error(error);
                    });
            }

        },
        SignOut: function () {


            const logoutRequest = {
                account: Me.MSAL.getAccountByUsername(Me.SignInUsername),
                postLogoutRedirectUri: Me.MSALConfig.auth.redirectUri,
                mainWindowRedirectUri: Me.MSALConfig.auth.redirectUri
            };

            Me.MSAL.logoutPopup(logoutRequest);

            Apps.SaveAuthenticationData('');
            Me.IsSignedIn = false;

            Me.RefreshButton();

        },

        /**
         * Configuration object to be passed to MSAL instance on creation. 
         * For a full list of MSAL.js configuration parameters, visit:
         * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
         * 98d2a023-82b9-43bc-bceb-3edc71792759 //spadmin app registration
         * 980a6442-5e5f-41a1-aec0-f3c5c21b70b3
         */
        MSALConfig: {
            auth: {
                clientId: "", 
                authority: "https://login.microsoftonline.com/common", //tenant or "common" (see https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/authority.md)
                redirectUri: location.origin
            },
            cache: {
                cacheLocation: "sessionStorage", // This configures where your cache will be stored
                storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
            },
            system: {
                loggerOptions: {
                    loggerCallback: (level, message, containsPii) => {
                        if (containsPii) {
                            return;
                        }
                        switch (level) {
                            case msal.LogLevel.Error:
                                console.error(message);
                                return;
                            case msal.LogLevel.Info:
                                console.info(message);
                                return;
                            case msal.LogLevel.Verbose:
                                console.debug(message);
                                return;
                            case msal.LogLevel.Warning:
                                console.warn(message);
                                return;
                        }
                    }
                }
            }
        },

        /**
         * Scopes you add here will be prompted for user consent during sign-in.
         * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
         * For more information about OIDC scopes, visit: 
         * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
         */
        LoginRequest: {
            scopes: ["User.Read"]
        },

        /**
         * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
         * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
         */
        TokenRequest: {
            scopes: ["User.Read", "Mail.Read"],
            forceRefresh: false // Set this to "true" to skip a cached token and go to the server to get a new token
        }
    };
    return Me;
})