CarisCommcareBridge
===================

Nodejs based server which processes forwarded cases and forms submissions from CommcareHQ (ODK) 

### Installation
Install node packages:

```sh
$ npm install
```
### Production Server
- Change mandrill.clientId, environment and host variable in config.js to "production"
- Add production subscriber list to SubscriberData.json
- User forever to run on Amazon EC2 (https://www.npmjs.com/package/forever)

```sh
forever start --uid "production" app.js
```

To stop forever service

```sh
forever stop production
```