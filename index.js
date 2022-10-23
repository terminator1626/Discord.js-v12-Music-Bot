const Discord = require("discord.js");
const enmap = require("enmap");
const config = require("./config.json");
const ms = require("ms");
const client = new Discord.Client();
client.config = config;

const DisTube = require('distube');

// Create a new DisTube
const distube = new DisTube(client, { searchSongs: true, emitNewSongOnly: true })

// ------------------------------------------------------------------------------  

client.on('ready', () => {
    console.log('Bot is Now Online & Working Fine')
});

// ------------------------------------------------------------------------------------------

client.on('message', async message => {
    if(!message.content.startsWith(config.prefix)) return;
    if(message.author.bot) return;
    if(!message.guild) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    
    if(command === "restart") {
        if(message.author.id !== `${config.ownerID}`)
            return message.reply(`This command is only ${config.ownerUsername}`)
        await message.channel.send(`Restarting bot...`)
        process.exit()
    }

    if (command === 'play' || command === 'p') { 
        if (!message.member.voice.channel) return message.reply("Please join a voice channel!")
        distube.play(message, args.join(' ')) 
        message.channel.send("Start playing!") 
    } 

	if (command === "loop" || command === "repeat") {
        if (!message.member.voice.channel) return message.reply("Please join a voice channel!")
        distube.setRepeatMode(message, parseInt(args[0]))
        message.channel.send("Loop activated!")
    } 
    if (command === "volume" || command === "vol") {
        if (!message.member.voice.channel) return message.reply("Please join a voice channel!")
        const volumelvl = args.slice(0).join(" ")
        distube.setVolume(message, volumelvl)
        message.channel.send(`Volume set to ${volumelvl}%`)
    } 

	if (command === 'stop') {
        if (!message.member.voice.channel) return message.reply("Please join a voice channel!")
		distube.stop(message)
		message.channel.send('Stopped the music!')
	}

    if (command === "pause") {
        if (!message.member.voice.channel) return message.reply("Please join a voice channel!")
        distube.pause(message)
        message.channel.send("Paused music!")
    }

    if (command === "resume") {
        if (!message.member.voice.channel) return message.reply("Please join a voice channel!")
        distube.resume(message)
        message.channel.send("Resumed music!")
    }

	if (command === 'skip' || command === 'next') {
        if (!message.member.voice.channel) return message.reply("Please join a voice channel!")
        distube.skip(message)
        message.channel.send("Skiped song!")
    }

    if (command === "autoplay" || command === "ap") {
        if (!message.member.voice.channel) return message.reply("Please join a voice channel!")
        distube.toggleAutoplay(message)
        message.channel.send("Change autoplay!")
    }

	if (command === 'queue' || command === 'q' || command === 'songs') {
        if (!message.member.voice.channel) return message.reply("Please join a voice channel!")
		const queue = distube.getQueue(message)
		message.channel.send(`Current queue:\n${queue.songs.map((song, id) =>
			`**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``).slice(0, 10).join('\n')}`)
	}

    if (command === 'nowplaying' || command === 'np' || command === 'song') {
        if (!message.member.voice.channel) return message.reply("Please join a voice channel!")
		const queue = distube.getQueue(message)
		message.channel.send(`Now playing: ${queue.songs.map((song, id) =>
			`${song.name} - \`${song.formattedDuration}\``).slice(0, 1).join('\n')}`)
	}

	if (command === `3d` || command === `bassboost` || command === `echo` || command === `karaoke` || command === `nightcore` || command === `vaporwave`) {
        if (!message.member.voice.channel) return message.reply("Please join a voice channel!")
		const filter = distube.setFilter(message, command)
		message.channel.send(`Current queue filter: ${filter || 'Off'}`)
	}

    if (command === "effects") {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle("Effects")
            .setColor("GREEN")
            .setDescription("`3d` , `bassboost` , `echo` , `karaoke` , `nightcore` , `vaporwave`")
        )
    }

    if (command === "help") {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle("HELP")
            .setColor("GREEN")
            .addFields({
                name: `${config.prefix}play`,
                value: `**Example:** ${config.prefix}play bass or ${config.prefix}play https://www.youtube.com/....\n**Aliases:** ${config.prefix}play , ${config.prefix}p`,
            }, {
                name: `${config.prefix}loop`,
                value: `**Example:** ${config.prefix}loop or ${config.prefix}loop song_id\n**Aliases:** ${config.prefix}loop , ${config.prefix}repeat`,
            }, {
                name: `${config.prefix}volume`,
                value: `**Example:** ${config.prefix}volume 50\n**Aliases:** ${config.prefix}volume , ${config.prefix}vol`,
            }, {
                name: `${config.prefix}stop`,
                value: `**Example:** ${config.prefix}stop\n**Aliases:** ${config.prefix}stop`,
            }, {
                name: `${config.prefix}pause`,
                value: `**Example:** ${config.prefix}pause\n**Aliases:** ${config.prefix}pause`,
            }, {
                name: `${config.prefix}resume`,
                value: `**Example:** ${config.prefix}resume\n**Aliases:** ${config.prefix}resume`,
            }, {
                name: `${config.prefix}skip`,
                value: `**Example:** ${config.prefix}skip\n**Aliases:** ${config.prefix}skip , ${config.prefix}next`,
            }, {
                name: `${config.prefix}autoplay`,
                value: `**Example:** ${config.prefix}autoplay\n**Aliases:** ${config.prefix}autoplay , ${config.prefix}ap`,
            }, {
                name: `${config.prefix}queue`,
                value: `**Example:** ${config.prefix}queue\n**Aliases:** ${config.prefix}queue , ${config.prefix}q , ${config.prefix}songs`,
            }, {
                name: `${config.prefix}nowplaying`,
                value: `**Example:** ${config.prefix}nowplaying\n**Aliases:** ${config.prefix}nowplaying , ${config.prefix}np , ${config.prefix}song`,
            }, {
                name: `${config.prefix}effects`,
                value: `**Example:** ${config.prefix}effects\n**Aliases:** ${config.prefix}effects`,
            })
        )
    }

})

// Queue status template
const status = queue => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || 'Off'}\` | Loop: \`${queue.repeatMode ? queue.repeatMode === 2 ? 'All Queue' : 'This Song' : 'Off'}\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``

// DisTube event listeners, more in the documentation page
distube
	.on('playSong', (message, queue, song) => message.channel.send(
		`Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}\n${status(queue)}`,
	))
	.on('addSong', (message, queue, song) => message.channel.send(
		`Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}\n${status(queue)}`,
	))
	.on('playList', (message, queue, playlist, song) => message.channel.send(
		`Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequested by: ${song.user}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`,
	))
	.on('addList', (message, queue, playlist) => message.channel.send(
		`Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`,
	))
// DisTubeOptions.searchSongs = true
	.on('searchResult', (message, result) => {
		let i = 0
		message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join('\n')}\n*Enter anything else or wait 60 seconds to cancel*`)
	})
// DisTubeOptions.searchSongs = true
	.on('searchCancel', message => message.channel.send(`Searching canceled`))
	.on('error', (message, e) => {
		console.error(e)
		message.channel.send(`An error encountered: ${e}`)
	})


client.login(config.token)

