
const { Client } = require("discord.js")
const client = new Client({ disableEveryone: false });
client.on('ready', () => {
  console.log(`Logged in as: ${client.user.tag}`)
})
const Gamedig = require('gamedig')
const Discord = require("discord.js");

const settings = require('./settings.json')
const token = require('./token.json')

let embedColor = '#035efc';
if(settings.color) embedColor = settings.color;
let embedTitle = 'No Title Set';
if(settings.embedTitle) embedTitle = settings.embedTitle;
let errorEmbedColor = '#035efc';
if(settings.errorColor) errorEmbedColor = settings.errorColor;
let errorEmbedTitle = 'No Error Title Set';
if(settings.embedErrorTitle) errorEmbedTitle = settings.embedErrorTitle;

let serverDefaultID = 'None';
let channelDefaultID = 'None';
if(settings.serverID) serverDefaultID = settings.serverID;
if(settings.channelID) channelDefaultID = settings.channelID;



client.on('ready', async () => {
  if(serverDefaultID === 'None') {
    if(channelDefaultID === 'None') {
      return console.log(`Please setup a valid channel & server id in the settings.json file!`)
    } else {
      return console.log(`Please setup a valid server id in the settings.json file!`)
    }
  }
  if(channelDefaultID === 'None') return console.log(`Please setup a valid channel id in the settings.json file!`);
  let numberToCheck = parseInt(settings.refreshTime);
  if(Number.isInteger(numberToCheck) === false) {
    return console.log(`Please provide a valid amount of seconds for the refresh time in settings.json!`)
  }


setInterval(() => {
Gamedig.query({
  type: 'fivem',
  host: settings.ip, 
  port: settings.port
}).then(async(state) => {
  let channelStatusToggle = false;
  let channelStatus = 'No';
  if(settings.enableChannelStatus) channelStatus = settings.enableChannelStatus;
  let channelStatusID = 'None';
  if(settings.channelStatusID) channelStatusID = settings.channelStatusID;
  if(channelStatus === 'Yes') {
    if(channelStatusID === 'None') return console.log(`You have enabled the channel status function but have not provided a valid channel id!`);
  }
  const serverToStatus = client.guilds.find(g => g.id === serverDefaultID);
  const channelToStatus =  serverToStatus.channels.find(c => c.id === channelStatusID);
  if(channelToStatus) {
    if(channelToStatus.type != 'voice') console.log(`Consider switching the 'channelStatusID' to a voice channel id. Otherwise you may get errors!`)
    if(channelStatus === 'Yes') {
      channelToStatus.setName(`${state.raw.clients} / ${state.raw.sv_maxclients} Players Online!`).catch(err => {
        console.log(`Error updating the channel status name! Error: ${err}`)
      })   
    }
  }
  var players = [];
  state.players.forEach(p => {
      players.push(`\`\`${p.name}\`\``)
  });
  var embed = new Discord.RichEmbed()
      .setColor(embedColor)
      .setTitle(embedTitle)
      .addField('__Server Information__' , `144.91.117.81:2034` )
      .addField('**Server Status:**', `:white_check_mark: Online`, true)
      .addField('**Online Players:**', `**Total:** \`${state.raw.clients}\` / \`${state.raw.sv_maxclients}\``, true)
      const server = client.guilds.find(g => g.id === settings.serverID)
      if(!server) return console.log(`Invalid server id provided! Is the bot in the server?`)
      const statuschannel = server.channels.find(c => c.id === settings.channelID);
      if(!statuschannel) return console.log(`Could not find the status channel! Is the id provided correct? Is the channel you provided in the server you provided?`)
      statuschannel.fetchMessage(settings.messageID).then((msg) => { 
          msg.edit(embed)
      })
}).catch(async() => {
  var embed = new Discord.RichEmbed()
      .setColor(errorEmbedColor)
      .addField('**Server Status:**', `Offline :x:!`)
      .setTitle(errorEmbedTitle);
      const server = client.guilds.find(g => g.id === settings.serverID) 
      if(!server) return console.log(`Invalid server id provided! Is the bot in the server?`)
      const statuschannel = server.channels.find(c => c.id === settings.channelID);
      if(!statuschannel) return console.log(`Could not find the status channel! Is the id provided correct? Is the channel you provided in the server you provided?`)
    statuschannel.fetchMessage(settings.messageID).then((msg) => { 
      msg.edit(embed)
  })
});
}, settings.refreshTime*1000)
})


client.on('message', message => {
  if(message.author.bot || !message.guild) return;
  if(message.content === '!setup') {
    if(!message.member.hasPermission("ADMINISTRATOR")) {
      const errorEmbed = new Discord.RichEmbed()
      .setColor("RED")
      .setDescription(`Only administrators can setup the live status!`);
      return message.channel.send(errorEmbed).then(msg => msg.delete(7500))
    }
    const setupEmbed = new Discord.RichEmbed()
    .setDescription(`Setting up...`);
    message.channel.send(setupEmbed).then(msg => {
      setTimeout(() => {
        const completeSetup = new Discord.RichEmbed()
        .setDescription(`Thanks for adding me!\n\nThis is the setup message for the **FiveM Live Status Bot!**\n\nCheck it out below:\nhttps://github.com/Gravxd/FiveM-Discord-Status\n\n---------------------------------\nMessageID: \`${msg.id}\`\nChannelID: \`${msg.channel.id}\`\nServerID: \`${msg.guild.id}\``)
        msg.edit(completeSetup)
      }, 5000)
      msg.edit()
    }).catch(err => {
      return console.log(`There was an error during setup: ${err}`)
    })
    if(message.guild.me.hasPermission("MANAGE_MESSAGES")) {
      message.delete();
    } else {
      const dmEmbed = new Discord.RichEmbed()
      .setDescription(`Once I have sent my setup message, you can delete your command!`);
      message.author.send(dmEmbed)
    }
  }
})

client.login(token.token)
