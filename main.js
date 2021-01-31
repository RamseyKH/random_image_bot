const jimp = require('jimp');
const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');
const probe = require('probe-image-size');
const randomWord = require('random-word');
require('dotenv').config();
const prefix = process.env.PREFIX;
const token = process.env.BOT_TOKEN

client.once('ready', () => {
    console.log('Ready!');
});

async function getImage(message) {
    let subreddits = [
        "EarthPorn",
        "megalophobia",
        "thalassophobia",
        "submechanophobia",
        "aww"
    ];
    var subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
    let postnumber = Math.floor((Math.random() * 24));
    let redditData = await axios.get(`https://www.reddit.com/r/${subreddit}/new.json?sort=new`);
    console.log("got data");
    let data = redditData.data.data.children;
    
    while (data[postnumber].data.is_video === true || data[postnumber].data.over_18 === true || data[postnumber].data.url === undefined || data[postnumber].data.url == '/\b(jpg|png|redd.it)\b/') {
        postnumber += 1;
    }
    console.log(data[postnumber].data.url);
    const image = await axios.get(data[postnumber].data.url,  { responseType: 'arraybuffer' }).then(img => {return img.data});
    console.log("image obtained");
    let size = await probe(data[postnumber].data.url);
    console.log("got size");
    const font = await jimp.loadFont(jimp.FONT_SANS_128_BLACK);
    let ext = data[postnumber].data.url.substr(data[postnumber].data.url.length - 4);
    let picture = await jimp.read(image).then(image => {
        return image
            .print(font, 0, 0, { text: randomWord(), alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_TOP }, size.width, size.height)
            .print(font, 0, 0, { text: randomWord(), alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_BOTTOM },size.width, size.height)
            .write('img' + ext)
    });
    message.channel.send({files: ['./img'+ ext ]});
    console.log("message sent");
}

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if (command === 'random') {
        getImage(message);
    }
});

client.login(token);
