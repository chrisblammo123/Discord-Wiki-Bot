// this link might be correct?
// https://discord.com/api/oauth2/authorize?client_id=1200729608136425493&permissions=277025475584&scope=bot
console.log(process.cwd())
// Node Modules
const discord = require('discord.js');
// const logging = require('winston');			//might not use this
const fs = require('fs');					// Only will be used for manual logging, will probably remove it if using winston

// Local Files
const config = require("./config.json");
//TODO: Possibly add a prefs.json or similar to allow for adding settings.


// Global Variables

// Interwiki prefix codes with their respective urls
const wikiPrefixCodes = {
	"w": "https://en.wikipedia.org/wiki/",				// Wikipedia
	"mw": "https://www.mediawiki.org/wiki/",			// MediaWiki
	"phab": "https://phabricator.miraheze.org/",		// Miraheze Phabricator
	"meta": "https://meta.miraheze.org/wiki/",			// Miraheze Meta Wiki
	false: "https://lethal.miraheze.org/wiki/"			// Lethal Company Wiki
};

// Array of Gateway Intents
const GatewayIntentList = [
	discord.GatewayIntentBits.Guilds,
	discord.GatewayIntentBits.GuildMessages,
	discord.GatewayIntentBits.MessageContent
];

// Date + logging variables
const date = new Date;
const betterDate = (date) => { return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}` };
const logFile = 'logs/' + betterDate(date) + '.log.';

if (!fs.existsSync('logs/')) {
	console.log('folder doesnt exist, creating');
	fs.mkdir('logs/', (err) => {
		if (err) throw err;
	});
}

// fs.access('/logs/', () => {});


// Creates the discord.js client to listen for events
const client = new discord.Client({ intents: GatewayIntentList });


// Global Functions

// Checks the message string for reasonable interwiki codes, returns false if none are found
const findInterwikiCode = (link) => {
	let prefix = false;
	let title = link;

	// Iterates through the list of interwiki codes
	Object.keys(wikiPrefixCodes).forEach( (interwikicode) => {
		// Checks to see if the wiki code is contained in the message string, and makes sure it is at the start (after the two brackets)
		if (link.indexOf(interwikicode + ':') == 2) {
			prefix = interwikicode;
			title = link.replace(interwikicode + ':', '');
			
			return;
		}
	});

	return [prefix, title];
};


// Sets up manual logger with fs
const writeLog = (logData, logType = 'INFO') => {
	// fs.writeFile() instead maybe???
	fs.appendFile(logFile, `${logType}: ${logData}`, (err) => {
		if (err) throw err;
		console.log('appended data to log: ' + logData);
	});
};



// Execution Start (Probably)

writeLog('Startup @ ' + new Date().toString(), 'INFO');

// Event Listeners

// Emitted on bot startup
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	writeLog('Logged In to Bot', 'INFO');
});


//this is some boilerplate stuff, will come back to it after its all done

// Emitted on slash command usage
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!');
	}
});


//on message create, look for '[[' and ']]' chars, isolate text between square brackets, respond with link

// Emitted on a message being sent
client.on('messageCreate', async (message) => {
	// Filters out bot messages
	if (message.author.bot) return;
	
	console.log(message);

	// Replacement characters
	// Is there a reason to have this here instead of with the other vars???
	const chars = {
		' ': '_',
		'[': '',
		']': ''
	};


	let msg = message.cleanContent;					// Isolates the message string itself from the message metadata


	let links = msg.match(/\[\[[\w #:]+\]\]/g);		// Matches wikitext syntax with basic filtering out bad page names
	
	console.log(`Message: ${msg}`);
	console.log(`Links Array: ${links}`);

	// No matches found
	if (links == null) return;						// Returns if there are no matches found

	
	// Loops through each match to reply with the link
	links.forEach((link) => {
		// Checks to see if the element contains an interwiki prefix

		let [interwikiPrefix, articleTitle] = findInterwikiCode(link);
		
		console.log(`interwiki prefix: ${interwikiPrefix}\narticle title: ${articleTitle}`);
		
		articleTitle = articleTitle.replace(/[\[\] ]/g, r => chars[r]);		// Formats the article name into url styling
		console.log(articleTitle);

		// Combines the full wiki URL (default stored here for now) and converts the page name to a PascalCase-esque format
		page = wikiPrefixCodes[interwikiPrefix] + articleTitle.replace(/^[a-z]|:[a-z]/g, c => c.toUpperCase());

		console.log(page);
		

		// Reply to message

		message.channel.send(page)
			.then(message => console.log(`Sent message: ${message.content}`))
			.catch(console.error);
	});


});




client.login(config.token);