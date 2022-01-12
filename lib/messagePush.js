// 向messagePush项目写入需要发送的消息
const Mongoose = require('mongoose');

class MessagePush{
    constructor({redisClient, senderModel}){
        this.redisClient = redisClient;
        this.senderModel = senderModel;
        this.redisMessagesKey = "messages";
    }

    // 将消息内容写入数据库和redis
    async sender(msgInfo){
        if (!this.redisClient || !this.senderModel) {
            return {code: -1, msgInfo: '请先初始化'};
        }

        if (!msgInfo.company_id || !msgInfo.agentid || !msgInfo.app_id) {
            return {code: -1, msgInfo: '参数错误'};
        }

        try {
            let sendData = {
                company_oid: Mongoose.Types.ObjectId(msgInfo.company_id),
                smartapp_oid: Mongoose.Types.ObjectId(msgInfo.app_id),
                msgtype: msgInfo.type,
            }
            if (msgInfo.detail_id) {
                sendData.detail_oid = Mongoose.Types.ObjectId(msgInfo.detail_id);
            }

            // 将发送人/部门的id进行格式化
            if (msgInfo.tousers && Array.isArray(msgInfo.tousers)) {
                sendData.user_oids = msgInfo.tousers.map((uid) => Mongoose.Types.ObjectId(uid));
            }
            if (msgInfo.group_oids && Array.isArray(msgInfo.group_oids)) {
                sendData.group_oids = msgInfo.group_oids.map((uid) => Mongoose.Types.ObjectId(uid));
            }
            if (msgInfo.party_ids && Array.isArray(msgInfo.party_ids)) {
                sendData.party_ids = msgInfo.party_ids.map((uid) => Number(uid));
            }

            // 不同类型消息的消息体进行处理
            switch (msgInfo.type) {
                case 'text':
                    sendData.text = {content: msgInfo.content};
                    break;
                case 'news':
                    // 给所有没有company_id的url加上company_id
                    if (msgInfo.articles[0].url && msgInfo.articles[0].url.indexOf('company_id=') < 0) {
                        if (msgInfo.articles[0].url.indexOf('?') < 0) {
                            msgInfo.articles[0].url = `${msgInfo.articles[0].url}?company_id=${msgInfo.company_id}`;
                        } else {
                            msgInfo.articles[0].url = `${msgInfo.articles[0].url}&company_id=${msgInfo.company_id}`;
                        }
                    }
                    sendData.news = {articles: msgInfo.articles};
                    break;
                case 'textcard':
                    // 给所有没有company_id的url加上company_id
                    if (msgInfo.textcard.url && msgInfo.textcard.url.indexOf('company_id=') < 0) {
                        if (msgInfo.textcard.url.indexOf('?') < 0) {
                            msgInfo.textcard.url = `${msgInfo.textcard.url}?company_id=${msgInfo.company_id}`;
                        } else {
                            msgInfo.textcard.url = `${msgInfo.textcard.url}&company_id=${msgInfo.company_id}`;
                        }
                    }
                    sendData.textcard = msgInfo.textcard;
                    break;
                default:
                    // 暂时不支持其它的类型，后面继续完善
                    break;
            }

            // 保存到数据库
            let senderData = await this.senderModel.schema(sendData).save();
            // 写入redis
            await this.redisClient.lpush(this.redisMessagesKey, senderData._id.toString());
            return {code: 0, msg: '消息成功写入消息队列'};
        } catch (e) {
            console.error(e);
            return {code: -1, msg: '消息写入消息队列失败'}
        }
    }
}

module.exports = MessagePush
