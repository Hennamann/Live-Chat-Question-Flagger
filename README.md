# Live Questions and Answers Lower Third Generator

A Nodejs Web app for flagging live chat comments as questions, and generating lower thirds.

  - Enable questions and answers on Live Streams.
  - Show questions from your audience as lower thirds.
  - Encourage more interaction from your Live audience.

### How It Works

![YouTube Live Chat Question Flagger](https://pro2-bar-s3-cdn-cf1.myportfolio.com/405f55c1b61f7dacd9f668750ad16523/2f320fb5-cf41-4c06-a115-a3d1fa87e40a_rw_1920.png?h=92a4275944c023755a7130f4764fff68)

* Live chat stream from YouTube livestream is displayed
* Click the "Mark as Question" button to flag a question.
* Questions get highlighted in yellow.
* Click "Generate Lower Third" to send the question to a static lower-third URL at /lowerthird

You can now use the generated lowerthird in a livestreaming app like OBS.

### What It Looks Like

![YouTube Live Chat Lower Third for Questions](https://musicradiocreative-community.s3-eu-west-2.amazonaws.com/original/1X/ef34d75e879646d473eca1ff18a633a7c390912c.jpg)

### Installation

This app requires [Node.js](https://nodejs.org/) v6+ to run.

These instructions assume you are using Debian.

Install the dependencies and clone the repo.

```sh
curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh
bash nodesource_setup.sh
apt-get install nodejs build-essential
git clone https://github.com/Hennamann/Live-Chat-Question-Flagger
```

Depending on what platforms you want to support you will need to fill in some info:

#### YouTube
If you want to support YouTube you need a YouTube auth key instructions can be found here: https://developers.google.com/youtube/registering_an_application You will also need to find your YouTube channel ID, instructions here: https://support.google.com/youtube/answer/3250431 

#### Facebook
Facebook requires a user access token from your personal facebook account, these can be obtained from here: https://developers.facebook.com/tools/explorer/ You will need a FaceBook application tool to do so. (User access tokens last for 1 month by default but can be extended to last for two months on this page: https://developers.facebook.com/tools/debug/accesstoken/). You will also need your facebook userid or pageid, the api should work with the id found in the url for you FaceBook page or user page, but you can also use this site to be 100% sure: https://findmyfbid.com/

#### Twitch
Twitch is really straightforward to setup, simply grab your Twitch username and you're set. 


Once you have the information you need, simply fill in the correct fields in the auth.example.json file and save it as auth.json doing something like this:
```sh
cd YouTube-Live-Chat-Question-Flagger
cp auth.example.json auth.json
nano auth.json
```
Don't worry if you don't use some of the live stream services, the server will ignore them as long as you avoid starting the apis for them (more on this later in the README).

Install Node Modules.

```sh
npm install
```

### Running The App

Start the app!

```sh
node index.js
```

Go to http://localhost:8080 to see the app in action.

View the lowerthird at http://localhost:8080/lowerthird.

Visiting the site at this point will reveal a fairly empty page, this is because you need to start the different live stream api pullers. If you have added API info for all the different services you can simply visit http://localhost:8080/startall and http://localhost:8080/stopall to stop the API pulllers. If you are not running all of them you have to manually use the start webhooks for the services you are using:
* **YouTube:** http://localhost:8080/startyt and http://localhost:8080/stopyt
* **FaceBook:** http://localhost:8080/startfb and http://localhost:8080/stopfb
* **Twitch:** http://localhost:8080/starttw and http://localhost:8080/stoptw

### Running The App Continously

To run the app continously you can use [forever](https://www.npmjs.com/package/forever):

```sh
npm install forever -g
forever start index.js
```

This will run the server even when you leave your ssh session. 

You can also use Screen, which comes bundled with almost any Linux installation:

```sh
screen -S server
```

To detach yourself from the screen press Ctrl+A then D separately. 

### Start The App on Boot Using Systemd

Create a service file for the application:

```sh
/etc/systemd/system/livechat.service
```

Include this inside the service file (modify slightly to match your setup):

```sh
[Service]
ExecStart=/usr/bin/node /root/Live-Chat-Question-Flagger/index.js
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=node-livechat
User=root
Group=root
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```sh
systemctl enable livechat
systemctl start livechat
```

You can restart and/or stop the service with the following commands:

```sh
systemctl restart livechat
systemctl stop livechat
```

### TODO
* **Add authentication:** As it stands there is no authentication for the app, meaning anyone with the url can flag comments and generate lowerthirds.
* **Improve the Twitch support:** This might prove difficult as Twitch does not have any APIs for getting twitch comments outside of the overly compicated IRC system. 

### Credits
This Nodejs app uses the following node modules:

* [Socket.io](https://socket.io/)
* [Express.js](https://expressjs.com/)
* [youtube-live-chat](https://www.npmjs.com/package/youtube-live-chat) (A slighly modified version: https://github.com/Hennamann/youtube-live-chat) 
* [facebook-live-chat](https://www.npmjs.com/package/facebook-live-chat)
* [jsesc](https://www.npmjs.com/package/jsesc)
* [unescape-js](https://www.npmjs.com/package/unescape-js)
* [twitch-webchat](https://www.npmjs.com/package/twitch-webchat)
* [event-chains](https://www.npmjs.com/package/event-chains)

Thanks to Mike Russell and Music Radio Creative for coming up with the idea, and helping the development of the app!

### Development

Want to contribute? Great! Just make a pull request with your changes and we will review it ASAP!

License
----

MIT
