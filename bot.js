// Node Modules
const discord = require('discord.js');


// Local Files
const config = require("./config.json");

const wikiPrefixCodes = {
	"w": "",
	"mw": "",
	"phab": "",
	"mira": "miraheze prefix"
}



// import { Client, GatewayIntentBits } from 'discord.js';
const client = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds, discord.GatewayIntentBits.GuildMessages] });
// const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});


client.on('messageCreate', async (message) => {
	if (message.author.bot) return;

	// Replacement characters
	const chars = {
		' ': '_',
		'[': '',
		']': ''
	};

	let msg = message.cleanContent;
	let links = msg.match(/\[\[[\w| |#|:]*\]\]/g);


	links.forEach((e) => {
		//send reply with link

		if (e.includes(':')) {
			let [interwikiPrefix, articleTitle] = e.split(':');
		}
		else {
			let interwikiPrefix = false, articleTitle = e;
		}

		let articleTitle = articleTitle.replace(/\[|\]/g, r => chars[r]);
		let link = 	
	});


});

//on message create, look for '[[' and ']]' chars, isolate text between square brackets, respond with link



client.login(config.token);