// this link might be correct?
// https://discord.com/api/oauth2/authorize?client_id=1200729608136425493&permissions=277025475584&scope=bot

// Node Modules
const discord = require('discord.js');
const fs = require('fs');					// Only will be used for manual logging, will probably remove it if using winston

// Local Files
const config = require("./config.json");
//TODO: Possibly add a prefs.json or similar to allow for adding settings.


// Global Variables and Functions

// Interwiki prefix codes with their respective urls
const wikiPrefixCodes = {
	"w": "https://en.wikipedia.org/wiki/",				// Wikipedia
	"mw": "https://www.mediawiki.org/wiki/",			// MediaWiki
	"phab": "https://phabricator.miraheze.org/",		// Miraheze Phabricator
	"meta": "https://meta.miraheze.org/wiki/",			// Miraheze Meta Wiki
	false: "https://lethal.miraheze.org/wiki/"			// Lethal Company Wiki
};

// Enum of log types
const LogTypes = Object.freeze({
    INFO,
	WARN,
    ERROR,
    FATAL_ERROR
});

// Array of Gateway Intents
const GatewayIntentList = [
	discord.GatewayIntentBits.Guilds,
	discord.GatewayIntentBits.GuildMessages,
	discord.GatewayIntentBits.MessageContent
];

// Creates the discord.js client to listen for events
const client = new discord.Client({ intents: GatewayIntentList });

// Date + logging variables
const date = new Date;
const betterDate = (date) => { return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}` };
const logFile = 'logs/' + betterDate(date) + '.log';

// Create logs folder if it does not exist
if (!fs.existsSync('logs/')) {
	console.log('folder doesnt exist, creating');
	fs.mkdir('logs/', (err) => {
		if (err) {
			console.log(`Create Log Folder Error: ${err}`);
			//handle error
		}
		// if (err) throw err;
	});
}

// Sets up manual logger with fs
/**
 * Prints out a string to the log file, marked as a specific log type
 * @param {string} logData String of data to be printed to the log
 * @param {LogTypes} logType The severity level or type log
 */
const writeLog = (logData, logType = 'INFO') => {
	// fs.writeFile() instead maybe???
	// need to look into changing this to a writable stream, also try catching it here for error stuff
	fs.appendFile(logFile, `${new Date().toTimeString().slice(0,8)} ${logType}: ${logData}\n`, (err) => {
		if (err) {
			console.log(`Append File Error: ${err}`);
			//handle error
		}
		// if (err) throw err;			// maybe replace this with just its own error handling, seems like that could be the best method
		console.log('appended data to log: ' + logData);
	});
};

// Checks the message string for reasonable interwiki codes, returns false if none are found
/**
 * Searches a given link for valid interwiki codes
 * @param {string} link The link to be searched
 * @returns {[string, string]} 
 */
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

// Last line of defense if a fatal error occurs, tries to print error to log before exiting
process.on('uncaughtException', (err, origin) => {
	writeLog('uncaughtException, exiting with code 9', 'FATAL ERROR');
	writeLog(`Caught exception: ${err}\n`, 'FATAL ERROR');
	writeLog(`Exception origin: ${origin}`, 'FATAL ERROR');

	// Sets exit code to 9
	process.exitCode = 9;
});

// Prints exit code, might remove this but want to test it out
// also doesnt work but im pretty sure its just because it doesnt have enough time
// also this is stupid whjy would i  need this its 5 am my brain is melting i spent an hour trying to make this shit work when there is no god damn reason for it to exist
process.on('exit', (code) => {
	writeLog(`About to exit with code: ${code}`, 'INFO');
	setTimeout(() => {
		console.log('bye');
	}, 2000)
  });

  // this is stupid, why would I need this when the only time it will happen is when I stop the program myself?!!?!? also it breaks it in a very interesting way
  // keeping it to test to make sure it catches the silly errors later
//   process.on('SIGINT', (code) => {
// 	writeLog(`About to exit with code 2 [${code}]`, 'INFO');
// 	process.exitCode = 2;
// 	process.exit()
//   });

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