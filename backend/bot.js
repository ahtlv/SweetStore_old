const { Telegraf } = require('telegraf')
const axios = require('axios')
const Config = require('./config')

const bot = new Telegraf(Config.telegram_token)

bot.start(async (ctx) => {

    let host = Config.host

    let users = []

    let query = 1

    try {
        const getUsers = await axios
            .get(host + '/users/' + query)
                .then((res) => {
                    return res.data
                })
                    .catch((ex) => console.log(ex))
        if (getUsers) {
            users = getUsers
        }
    } catch (ex) {
        console.log(ex)
    }

    let user = users.find((user) => user.cid === ctx.message.chat.id)

    if (user) {
        console.log('User found!')
    } else {
        try {
            await axios
                .post(host + '/users', {
                    cid: ctx.message.chat.id,
                    status: 'member'
                })
                    .then((res) => console.log('User registred!'))
                        .catch((error) => console.log(error))
        } catch (ex) {
            console.log(ex)
        }
    }
        
    ctx.reply('Давайте начнем!\n\nИспользуйте этого бота, чтобы протестировать вымышленный маркетплейс!', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: `Каталог товаров`,
                        web_app: {url: Config.domain}
                    }
                ]
            ]
        }
    })
})
bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true)) 
bot.hears('/admin', (ctx) => ctx.reply('Добро пожаловать в пункт управления онлайн магазином!\n\nСледуйте инструкциям ниже, чтобы начать!', {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: `Добавить товар`,
                    web_app: {url: Config.domain + '/panel'}
                }
            ],
            [
                {
                    text: `Добавить категорию товаров`,
                    web_app: {url: Config.domain + '/panel/categories'}
                }
            ],
            [
                {
                    text: `Просмотреть заказы`,
                    web_app: {url: Config.domain + '/panel/orders'}
                }
            ],
            [
                {
                    text: `Настроить обратную связь`,
                    web_app: {url: Config.domain + '/panel/feedback'}
                }
            ],
            [
                {
                    text: `Все настройки`,
                    web_app: {url: Config.domain + '/panel/settings'}
                }
            ]
        ]
    }
}))
bot.launch()