// Node Modules
const discord = require('discord.js');

// Local Files
const config = require("./config.json");


// Interwiki prefix codes with their respective urls
const wikiPrefixCodes = {
	"w": "https://en.wikipedia.org/wiki/",				// Wikipedia
	"mw": "https://www.mediawiki.org/wiki/",			// MediaWiki
	"phab": "https://phabricator.miraheze.org/",		// Miraheze Phabricator
	"meta": "https://meta.miraheze.org/wiki/"			// Miraheze Meta Wiki
};

// Array of Gateway Intents
const GatewayIntentList = [
	discord.GatewayIntentBits.Guilds,
	discord.GatewayIntentBits.GuildMessages,
	discord.GatewayIntentBits.MessageContent
];

// import { Client, GatewayIntentBits } from 'discord.js';
const client = new discord.Client({ intents: GatewayIntentList });
// const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

//this is some boilerplate stuff, will come back to it after its all done
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});


client.on('messageCreate', async (message) => {
	// Filters out bot messages
	if (message.author.bot) return;

	// Replacement characters
	const chars = {
		' ': '_',
		'[': '',
		']': ''
	};

	// This *should* work, might need to change to just the 'content' but that requires more gateway intentions with manual approval
	let msg = message.cleanContent;

	let links = msg.match(/\[\[[\w #:]+\]\]/g);		// Matches wikitext syntax with basic filtering out bad page names
	
	console.log(`Message: ${msg}`);
	console.log(`Links Array: ${links}`);

	// No matches found
	if (links == null) return;


//	/** 
	// Loops through each match to reply with the link
	links.forEach((link) => {
		// Checks to see if the element contains an interwiki prefix
		let [interwikiPrefix, articleTitle] = (link) => {
			if (link.includes(':')) {
				let prefix = false;
				let title = null;

				Object.keys(wikiPrefixCodes).forEach( (interwikicode) => {
					if (link.includes(interwikicode + ':')) {
						prefix = interwikicode;
						
						title = link.replace(interwikicode + ':', '');
						return;
					}
				});
				
			}
			else {
				return [false, link];
			}
		};


		// if (e.includes(':')) {
		// 	let [interwikiPrefix, articleTitle] = e.split(':');
		// }
		// else {
		// 	let interwikiPrefix = false, articleTitle = e;
		// }
		
		articleTitle = articleTitle.replace(/[\[\] ]/g, r => chars[r]);		// Formats the article name as url styling
		// let link = 	
	});
//*/


});

//on message create, look for '[[' and ']]' chars, isolate text between square brackets, respond with link



client.login(config.token);