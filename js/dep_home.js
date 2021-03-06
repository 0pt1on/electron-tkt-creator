/**
 * Home Object. Each function relative to the home page
 * is stored in this object. Listeners then use the
 * home object to make appropriate function calls.
 * 
 * Functions:
 * 
 * Login() :: void
 */
let changelog = require('./modules/Changelog');
$(() => { // Set version on load
    for(let obj in changelog) {
        $('#version').text(changelog[obj].name);
        break;
    } // End after first object
});

let Home = new function()
{
    /**
     * Login property that deals with allowing the
     * user to log into the application.
     * 
     * Functions:
     * login(string, string)                    :: void
     * checkUsernamePassword(string, string)    :: void
     * checkUsername(string)                    :: void
     * displayError(string)                     :: void
     * resetError(string)                       :: void
     */
/**/this.Login = new function()
    {
        this.username = ''; // username: string.
        this.password = ''; // password: string.
        this.name = ''; // name of the user: string
        this.errorMsg = ''; // error message to be displayed: string.

        this.loggedIn = false; // is user logged in?: bool
        this.error = false; // does an error exist with log in?: bool

        /**
         * Logs the user in by sending a test GET request to
         * the Sonar API with the entered username and password
         * as the authentication. 
         * 
         * If successful, then the user is informed that they are
         * logged in.
         * 
         * If anything fails, then they are provided the
         * appropriate error message - typically "incorrect
         * username or password".
         * 
         * @param {*} username 
         * @param {*} password 
         */
        this.login = function(username, password)
        {
            this.user = username;
            this.pass = password;
            this.Sonar = require('../server/Sonar.js');
            this.Towers = require('./modules/Towers.js');

            // Authenticates and logs the user in if successful with username and password.
            this.Sonar.Login.Authenticate(this.user, this.pass, (data) => {
                
                if(data.error)
                {
                    this.error = true;
                    
                    if(data.error.status_code == 401)
                        this.errorMsg = 'Incorrect username or password!';
                    else
                        this.errorMsg = 'Inform Admin of Error Code ' + data.error.status_code + '!';

                    this.displayError('#err-login');
                }
                else
                {
                    console.log('Success! ', data);
                    this.name = this.getName(username, data);
                    this.loggedIn = true;
                    this.welcomeUser();
                    this.createSession();
                    this.Towers.RetrieveTowers();
                }
            });

            /**
             * Once the user is successfully logged in, get the
             * public name of the user to inform them they
             * successfully logged in.
             * @param {*} username 
             * @param {*} data 
             */
            this.getName = function(username, data)
            {
                for(let i = 0; i < data.data.length; i++)
                    if(data.data[i].username.toLowerCase() == username.toLowerCase()) // Changed to compare when all lowercase to an 'undefined' name.
                        return data.data[i].public_name;
            }
        }

        /**
         * Utilizes the username, password, and loggedIn
         * variables to create a session state for the user.
         */
        this.createSession = function()
        {
            sessionStorage.username = this.username;
            sessionStorage.password = this.password;
            sessionStorage.name = this.name;
            sessionStorage.loggedIn = this.loggedIn;
        }

        /**
         * Welcome the user with their username when 
         * the successfully login.
         */
        this.welcomeUser = function()
        {
            $('#input-block-log-in').removeClass('input-block').addClass('input-block-hidden');
            $('#input-block-logged-in').removeClass('input-block-hidden').addClass('input-block');
            $('.login-success').text('Welcome, ' + this.name + '!');
        }

        /**
         * Checks the username and password entered by the user
         * when the login button is pressed.
         * @param {*} username 
         * @param {*} password 
         */
        this.checkUsernamePassword = function(username, password)
        {
            this.username = username;   // string value entered as username.
            this.password = password;   // string value entered as password.

            // check any errors with username / password entered.
            if(this.username == '' || this.password == '')  // check if blank.
            {
                this.error = true;
                this.errorMsg = 'Username or Password cannot be blank!';
            }
            else // if no errors
                this.resetError('#err-login');

            if(this.error)
            {
                this.displayError('#err-login');
                return;
            }

            this.login(this.username, this.password);
        }

        /**
         * Checks the username on the key up event.
         * This is used to inform the user of any error
         * while they are typing. "Live error checkin".
         * @param {*} username 
         */
        this.checkUsername = function(username)
        {
            this.username = username;

            if(this.username.indexOf(' ') >= 0) // check for any whitespace
            {
                this.error = true;
                this.errorMsg = 'Username cannot contain whitespace!';
            }
            else if(this.username.match(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi))
            {
                this.error = true;
                this.errorMsg = 'Username contains invalid characters!';
            }
            /*else if(this.username.match(/[A-Z]/))
            {
                this.error = true;
                this.errorMsg = 'Username contains uppercase characters!';
            }*/
            else
                this.resetError('#err-username');

            if(this.error)
                this.displayError('#err-username');

        }

        /**
         * If there is an error and this function is called,
         * then the error message is displayed to the user.
         * @param {*} id -> element location of error message
         */
        this.displayError = function(id)
        {
            if(this.error)
                $(id).text(this.errorMsg);
        }

        /**
         * Resets error message when error is resolved.
         * @param {*} id -> element location of error message.
         */
        this.resetError = function(id)
        {
            this.error = false;
            this.errorMsg = '';
            $(id).text('');
        }

    }

    /**
     * Data that needs to be retrieve upon reload.
     */
    this.Reload = new function()
    {
        this.towers = function()
        {
            this.Towers = require('./modules/Towers.js');
            this.Towers.RetrieveTowers();
        }
    }
/**/
};
let update = false;
let displayed = false;

/**
 * Login button-clicked listener
 */
$('#btn-home-login').on('click', () => {
    if(!Home.error)
        Home.Login.checkUsernamePassword($('#input-login-username').val(), $('#input-login-password').val());
    else
        Home.Login.displayError();
});

/**
 * Back button clicked listener
 */
$('#btn-changelog-back').on('click', () => {
    displayed = false;
    $('#input-block-changelog').removeClass('input-block');
    $('#input-block-changelog').addClass('input-block-hidden');

    if(!Home.Login.loggedIn)
    {
        $('#input-block-log-in').removeClass('input-block-hidden');
        $('#input-block-log-in').addClass('input-block');
    }
    else
    {
        $('#input-block-logged-in').removeClass('input-block-hidden');
        $('#input-block-logged-in').addClass('input-block');
    }
    $('.changelog-description h1').remove();
    $('.changelog-description p').remove();

});

/**
 * User typing in username listener
 */
$('#input-login-username').keyup(() => {
    Home.Login.checkUsername($('#input-login-username').val());
});

/**
 * On version click - update software if needed.
 */
$('#version').on('click', () => {
    if(update)  // If we are ready to update.
    {
        ipcRenderer.send('quitAndInstall');
        $('#update-ready p').text('Updating...');
        update = false;
    }
    else
    {
        if(displayed) return;

        if(!Home.Login.loggedIn)
        {
            $('#input-block-log-in').removeClass('input-block');
            $('#input-block-log-in').addClass('input-block-hidden');
        }
        else
        {
            // Open changelog.
            $('#input-block-logged-in').removeClass('input-block');
            $('#input-block-logged-in').addClass('input-block-hidden');
        }
        $('#input-block-changelog').removeClass('input-block-hidden');
        $('#input-block-changelog').addClass('input-block');

        // Show info.
        for(let obj in changelog)
        {
            $('.changelog-description').append('<h1> ' + changelog[obj].name + ' </h1>')
            for(let i = 0; i < changelog[obj].description.length; i++)
                $('.changelog-description').append('<p> ' + changelog[obj].description[i] + '</p>');
        }
        displayed = true;
    }
});

const ipcRenderer = require('electron').ipcRenderer;
/**
 * When checking for an update, inform the user.
 */
ipcRenderer.on('checkingForUpdate', (event, text) => {
    $('#update-ready p').text('Checking For Update...');
});

/**
 * When downloading the update, inform the user.
 */
ipcRenderer.on('download-progress', (event, text) => {
    $('#update-ready p').text('Downloading Update...');
});

/**
 * When no update is found, inform the user they are
 * up-to-date.
 */
ipcRenderer.on('update-not-available', (event, text) => {
    $('#update-ready p').text('Up To Date!');
});

/**
 * When the update is ready, inform the user and provide
 * the option to install the new update.
 */
ipcRenderer.on('updateReady', (event, text) => {
    $('#update-ready p').text('Update Is Available!');
    $('#version').css('color', 'red');
    $('#version').addClass('version-update');
    update = true;
});

/**
 * When page loads, check if session is still available and
 * update elements accordingly.
 */
$(window).on('load', () => {
    if(sessionStorage.loggedIn)
    {
        Home.Login.loggedIn = true;
        Home.Login.username = sessionStorage.username;
        Home.Login.password = sessionStorage.password;
        Home.Login.name = sessionStorage.name;
        Home.Login.welcomeUser();
        Home.Reload.towers();
    }
});

/**
 * On enter key pressed, click login button.
 */
$(window).on('keydown', (e) => {
    if(e.keyCode === 13 && !Home.Login.loggedIn)
        $('#btn-home-login').click();
});