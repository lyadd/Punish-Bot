const Discord = require("discord.js")
const client = new Discord.Client({
    intents: Object.keys(Discord.Intents.FLAGS),
})
const client2 = new Discord.Client({
    intents: Object.keys(Discord.Intents.FLAGS),
})
const db = require("quick.db")
const prefix = "="

const owners = [
    "ID OWNER 1",
    "ID OWNER 2",
    "ID OWNER 3",
    "ID OWNER 4",
]

client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (message.channel.type !== "GUILD_TEXT") return;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "help") {
        if (!owners.includes(message.author.id)) return
        const embed = new Discord.MessageEmbed()
            .setAuthor({ name: '⚙️ Liste de toutes les commandes du punish.' })
            .setDescription(`\`=punish @member ou ID\`\n *Permet d'ajouter un membre pour plus qu'il puisse plus écrire et rejoindre une vocale.*\n \n\`=remove @member ou ID\`\n *Permets de retirer un membre pour qu'il puisse à nouveau écrire et rejoindre une vocale.*\n\n\`=list\`\n*Permets de voir la liste de toutes les personnes punish.*\n\n\`=help\`\n *Permet d'obtenir toutes les commandes*.`)
            .setColor("2f3136")
        message.channel.send({ embeds: [embed] })
    }

    if (command === "punish") {
        if (!owners.includes(message.author.id)) return
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) return message.channel.send(`Membre introuvable !`)
        if (owners.includes(member.id)) return message.reply(`Impossible de punish un owner.`)
        if (!args[0]) return message.channel.send({ content: `Veullez mentionnez un membre valide.` })
        if (db.get(`punition_${message.guild.id}_${member.user.id}`) === true) return message.channel.send(`${member.user.username} est déjà punish.`)
        db.set(`punition_${message.guild.id}_${member.id}`, true)
        message.channel.send(`\`${member.user.tag}\` a été punish.`)
        member.voice.disconnect().catch(() => { })
    }

    if (command === "remove") {
        if (!owners.includes(message.author.id)) return
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) return message.channel.send({ content: `Membre introuvable.` })
        if (owners.includes(member.id)) return message.reply(`Impossible de remove un owner.`)
        if (!args[0]) return message.channel.send({ content: `Veullez mentionnez un membre valide.` })
        if (db.get(`punition_${message.guild.id}_${member.user.id}`) === null) return message.channel.send(`${member.user.username} n'est pas punish.`)

        db.delete(`punition_${message.guild.id}_${member.id}`)
        message.channel.send(`\`${member.user.tag}\` a été pardonner.`)
    }

    if (command === "list" || command === "punish-list") {
        if (!owners.includes(message.author.id)) return
        const memberPunition = db.fetchAll(`punition`)
        if (memberPunition && memberPunition.length) {
            const Punition = memberPunition.filter(x => x.data === 'true').map(w => '<@' + message.guild.members.cache.get(w.ID.split('_')[2]).user.id + '> : ' + '\`' + message.guild.members.cache.get(w.ID.split('_')[2]).user.id + '\`').join("\n")
            const embed = new Discord.MessageEmbed()
                .setTitle(`Liste des membres punis`)
                .setDescription(Punition)
                .setColor("2f3136")
            message.channel.send({ embeds: [embed] })
        } else {
            return message.channel.send(`Vous n'avez aucun membre punish.`)
        }

    }
})
client.on("messageCreate", async message => {
    if (db.get(`punition_${message.guild.id}_${message.author.id}`) === true) {
        message.delete().catch(() => { })
    }
})

client.on("voiceStateUpdate", async newState => {
    if (db.get(`punition_${newState.guild.id}_${newState.member.user.id}`) === true) {
        newState.member.voice.disconnect().catch(() => { })
    }
})

client2.on("messageCreate", async message => {
    if (db.get(`punition_${message.guild.id}_${message.author.id}`) === true) {
        message.delete().catch(() => { })
    }
})

client2.on("voiceStateUpdate", async newState => {
    if (db.get(`punition_${newState.guild.id}_${newState.member.user.id}`) === true) {
        newState.member.voice.disconnect().catch(() => { })
    }
})

client.login("TOKEN BOT 1")
client2.login("TOKEN BOT 2")