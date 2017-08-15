# YouTube Live Questions and Answers Lower Third Generator

A nodejs web app for flagging youtube live chat comments as questions, and generating lower thirds.

  - Enable questions and answers on YouTube Live
  - Show questions from your audience as lower thirds
  - Encourage more interaction from your YouTube Live audience

### How It Works

![YouTube Live Chat Question Flagger](https://musicradiocreative-community.s3-eu-west-2.amazonaws.com/original/1X/7ffef9430b48907f8c6673a6b2c84339e7c47e05.gif)

* YouTube Live Chat streams in on the left.
* Click the "?" symbol to flag a question.
* Questions appear on the right.
* Click "Generate Lower Third" to send the question to a static lower-third URL at /lowerthird

### How It Looks

![YouTube Live Chat Lower Third for Questions](https://musicradiocreative-community.s3-eu-west-2.amazonaws.com/original/1X/ef34d75e879646d473eca1ff18a633a7c390912c.jpg)

### Installation

This app requires [Node.js](https://nodejs.org/) v6+ to run.

Install the dependencies and clone the repo.

```sh
$ curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh
$ bash nodesource_setup.sh
$ apt-get install nodejs build-essential
$ git clone https://github.com/Hennamann/YouTube-Live-Chat-Question-Flagger
```

Add your YouTube Channel ID and API key.

```sh
$ cd YouTube-Live-Chat-Question-Flagger
$ cp auth.example.json auth.json
$ nano auth.json
```

Install Node Modules.

```sh
$ npm install
```

Start the app!

```sh
node index.js
```

Go to http://localhost to see the app in action.

View the lowerthird at http://localhost/lowerthird.

### Development

Want to contribute? Great!

License
----

MIT
