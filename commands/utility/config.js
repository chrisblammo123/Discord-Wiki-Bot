const discord = require('discord.js');

module.exports = {
	data: new discord.SlashCommandBuilder()
		.setName('config')
		.setDescription('Assign wiki host')
		.setDefaultMemberPermissions(String((1 << 3) | (1 << 5))),
	async execute(interaction) {
		await let server = interaction.guild
	}
};