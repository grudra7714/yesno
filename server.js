const express = require('express')
const app = express()
const rp = require("request-promise");
const path = require("path");
const request = require("request");
const bodyParser = require('body-parser');
const querystring = require("querystring");
const fs = require("fs");
const http = require("http");
require('dotenv').load();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let token = process.env.SLACK_OAUTH_TOKEN;

const postToSlack = async (endpoint, payload) => {
    var data = {
      url: endpoint,
      body: payload,
      headers: {
            'Content-Type': 'application/json'
        },
        json: true
    }
    return await rp.post(data);
}

app.post("/api/yesno", async (req, res) => {
	let yes_no = await rp.get("https://yesno.wtf/api/");
	let obj = JSON.parse(yes_no);
	if(!token) {
		var body = {
			attachments: [{
				"pretext": req.body.text,
				"text": obj.answer,
				"image_url": obj.image,
			}],
			"channel": req.body.channel_id,
			"as_user": "true"
		};
		await postToSlack(req.body.response_url, body);
	} else {
		var body = {
			attachments: JSON.stringify([{
				"pretext": req.body.text,
				"text": obj.answer,
				"image_url": obj.image,
			}]),
			"channel": req.body.channel_id,
			"as_user": "false"
		};
		var data = {
			url: 'https://slack.com/api/' + 'chat.postMessage' +'?token='+ token,
			formData: body,
		}
		let a  = await rp.post(data);
	}
	res.send("");
})

app.listen(process.env.PORT || 6000, function () {
  console.log('Server listening on port ' + (process.env.PORT || 6000));
})
