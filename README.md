# Live Questions and Answers Lower Third Generator

A nodejs web app for flagging youtube live chat comments as questions, and generating lower thirds.

  - Enable questions and answers on YouTube Live
  - Show questions from your audience as lower thirds
  - Encourage more interaction from your YouTube Live audience

### How It Works

![YouTube Live Chat Question Flagger](https://musicradiocreative-community.s3-eu-west-2.amazonaws.com/original/1X/2394cc01970a633dcc20f0640de689b95338d134.png)

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

Add your YouTube Channel ID and API key.

```sh
cd YouTube-Live-Chat-Question-Flagger
cp auth.example.json auth.json
nano auth.json
```

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

The app does not check your configured channel for a livestream until you visit http://localhost:8080/startyt.
Visiting that page will start the YouTube API which will attempt to find your livestream trough yout channel. When your stream is over you have to manually stop the app by visting this page: http://localhost:8080/stopyt.

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

### Credits
This nodejs app uses the following node modules:

* [Socket.io](https://socket.io/)
* [Express.js](https://expressjs.com/)
* [youtube-live-chat](https://www.npmjs.com/package/youtube-live-chat) (A slighly modified version: https://github.com/Hennamann/youtube-live-chat) 
* [facebook-live-chat](https://www.npmjs.com/package/facebook-live-chat)

Thanks to Mike Russel and Music Radio Creative for coming up with the idea, and helping the development of the app!

### Development

Want to contribute? Great! Just make a pull request with your changes and we will review it ASAP!

License
----

MIT
