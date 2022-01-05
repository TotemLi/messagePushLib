const MessagePush = require('./lib/messagePush');

module.exports = (function(options){
    return new MessagePush(options);
})
