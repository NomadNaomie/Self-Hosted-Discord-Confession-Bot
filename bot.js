const { Client, Intents,MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { token } = require('./config.json');



const intentArray = [
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING
]

class ConfessionBot extends Client{
    constructor(approvalChannel, confessionChannel, serverName, imageLink, cooldown){
        super({intents:intentArray,partials:["CHANNEL"]});
        this.approvalChannel = approvalChannel
        this.confessionChannel = confessionChannel
        this.serverName = serverName;
        this.imageLink = imageLink;
        this.cooldown = cooldown;
        this.cooldown ? this.talkedRecently = {} : {}
        this.messageDir = {}
    }
}
const client = new ConfessionBot(
    "Approval ID",
    "Support ID",
    "Server Name",
    "Icon URL",
    true
);

client.once('ready', () => {
	console.log('Ready!');
    client.approvalChannel = client.channels.cache.find(channel => channel.id == client.approvalChannel);
    client.confessionChannel = client.channels.cache.find(channel => channel.id == client.confessionChannel);
});
client.on("messageCreate",(message)=> {
    if (message.author.id == client.user.id){return;}
    else if (message.guildId != null){
        return;
    }else{
        if (client.cooldown){
            timeConfessionReceived = new Date().getTime();
            if (client.talkedRecently.hasOwnProperty(message.author.id)){
                console.log(client.talkedRecently);
                if (!client.talkedRecently[message.author.id] < timeConfessionReceived){
                    message.author.send("You're on cooldown, please wait before sending another confession").catch(error => {console.log("A")});
                    return;
                }
            }
            client.talkedRecently[message.author.id] = timeConfessionReceived + (600 * 1000)
            approvalEmbed = new MessageEmbed()
            .setColor("#e09eff")
            .setTitle("Confession")
            .setDescription(message.content)
            .setAuthor(`${client.serverName} Confession`,`${client.imageLink}`)
            const approvalRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId("approve")
                .setLabel("Approve")
                .setStyle("SUCCESS"),
                new MessageButton()
                .setCustomId("deny")
                .setLabel("Deny")
                .setStyle("DANGER"),
                new MessageButton()
                .setCustomId("trigger")
                .setLabel("Approve with Trigger Warning")
                .setStyle("SECONDARY"),
                new MessageButton()
                .setCustomId("reveal")
                .setLabel("Reveal Identity")
                .setStyle("DANGER"),
            )
            approvalMessage = client.approvalChannel.send({embeds: [approvalEmbed],components:[approvalRow]}).then((a)=>{client.messageDir[a.id]=message})
            receivedEmbed = new MessageEmbed()
            .setColor("#e09eff")
            .setTitle("Confession")
            .setDescription("Your confession is in the approval queue")
            .setAuthor(`${client.serverName} Confession`,`${client.imageLink}`)
            message.author.send({embeds:[receivedEmbed]}).catch(error => {console.log("C")});
        }
    }
});

client.on('interactionCreate', interaction => {
    if (!interaction.isButton()) return;
    if (!client.messageDir.hasOwnProperty(interaction.message.id))return;
    for (button of interaction.message.components[0].components){
        button.setDisabled(true);
    }
    message = client.messageDir[interaction.message.id]
    if (interaction.customId == "approve"){
        ConfessionEmbed = new MessageEmbed()
        .setTitle("Confession")
        .setDescription(message.content)
        .setAuthor(`${client.serverName} Confession`,`${client.imageLink}`)
        client.confessionChannel.send({embeds:[ConfessionEmbed]})
        approvedConfessionEmbed = new MessageEmbed()
        .setTitle("Confession")
        .setColor("#e09eff")
        .setDescription("Your confession has been posted.")
        .setAuthor(`${client.serverName} Confession`,`${client.imageLink}`)
        message.author.send({embeds:[approvedConfessionEmbed]});
        interaction.reply({content:"Approved the Confession",ephemeral:false})
    }else if (interaction.customId == "deny"){
        approvedConfessionEmbed = new MessageEmbed()
        .setTitle("Confession")
        .setColor("#e09eff")
        .setDescription("Your confession has NOT been posted.")
        .setAuthor(`${client.serverName} Confession`,`${client.imageLink}`)
        message.author.send({embeds:[approvedConfessionEmbed]});
        interaction.reply({content:"Denied the Confession",ephemeral:false})
    }else if(interaction.customId == "trigger"){
        triggerConfession = new MessageEmbed()
        .setTitle("Confession")
        .setDescription(`*${client.serverName} staff have determined this confession might be triggering for some people.*`)
        .setColor("#e09eff")
        .setAuthor(`${client.serverName} Confession`,`${client.imageLink}`)
        .addField("_ _",`||${message.content.replaceAll("||","")}||`)
        client.confessionChannel.send({embeds:[triggerConfession]});
        approvedConfessionEmbed = new MessageEmbed()
        .setTitle("Confession")
        .setColor("#e09eff")
        .setDescription(`${client.serverName} staff posted your confession with a trigger warning.`)
        .setAuthor(`${client.serverName} Confession`,`${client.imageLink}`)
        message.author.send({embeds:[approvedConfessionEmbed]});
        interaction.reply({content:"Posted the Confession with a Trigger Warning",ephemeral:false})
    }else if (interaction.customId == "reveal"){
        revealedEmbed = new MessageEmbed()
        .setTitle(`${client.serverName} staff have revealed who you are`)
        .setDescription(`${client.serverName} staff have chosen not to post your confession and to reveal your identity.`)
        .setAuthor(`${client.serverName} Confession`,`${client.imageLink}`)
        message.author.send({embeds:[revealedEmbed]});
        interaction.reply({ content:`Confessor: <@${message.author.id}>`,ephemeral:false})
    }
});
client.login(token);