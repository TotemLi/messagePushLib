# messagePushLib

# Installation

using npm:

`npm i messagepushlib`

# Config api platform client

fill config json object and get client instance

```
const RedisClient = require('./libs/redis.js').redisClient;
const SenderModel = require('./models/sender.js');
const messagePushOption = {
    redisClient: RedisClient,
    senderModel: SenderModel
}
const messagePushClient = require('messagepushlib')(messagePushOption);
```

# Usage

push message info :

```
// news 类型
let msgInfo = {
    type: 'news',
    company_id: '****',
    tousers: ['****'],
    group_oids: ['****'],   // 收消息部门id，我们的id(是ObjectID)
    party_ids: [**],    // 收消息部门id，企业微信的id(是数字)
    articles: [
        {
            title: `测试messagePushLib`,
            description: '这是测试描述',
            url: '****',
        }
    ],
    agentid: '****',
    app_id: '****',
    detail_id: '****',  // 可选，推送给mos平台时所需要的数据id
}

// // text 类型
// let msgInfo = {
//     type: 'text',
//     company_id: '****',
//     tousers: ['****'],
//     group_oids: ['****'],   // 收消息部门id，我们的id(是ObjectID)
//     party_ids: [**],    // 收消息部门id，企业微信的id(是数字)
//     content: '这是文本内容',
//     agentid: '****',
//     app_id: '****',
//     detail_id: '****',  // 可选，推送给mos平台时所需要的数据id
// }

// // textcard 类型
// let msgInfo = {
//     type: 'textcard',
//     company_id: '****',
//     tousers: ['****'],
//     group_oids: ['****'],   // 收消息部门id，我们的id(是ObjectID)
//     party_ids: [**],    // 收消息部门id，企业微信的id(是数字)
//     textcard: {
//         description: '这是描述',
//         btntxt: "这是按钮",
//         url: '****',
//         title: "这是标题"
//     },
//     agentid: '****',
//     app_id: '****',
//     detail_id: '****',  // 可选，推送给mos平台时所需要的数据id
// }

let result = await messagePushClient.sender(msgInfo);
// { code: 0, msg: '消息成功写入消息队列' }
// code 为非0时表示异常，异常信息见msg
```
