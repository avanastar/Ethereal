/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { REST } from '@discordjs/rest'
import { Routes } from 'discord.js'
import { readdirSync } from 'fs'
import type ApplicationCommand from './templates/ApplicationCommand.js'
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10'

export default async function deployGlobalCommands() {
    const commands: RESTPostAPIApplicationCommandsJSONBody[] = []
    const commandFiles: string[] = readdirSync('./commands').filter(
        (file) => file.endsWith('.js') || file.endsWith('.ts')
    )

    for (const file of commandFiles) {
        const command: ApplicationCommand = (await import(`./commands/${file}`))
            .default as ApplicationCommand
        commands.push(command.data.toJSON())
    }

    const rest = new REST({ version: '10' }).setToken(Bun.env.TOKEN)

    try {
        console.log('Started refreshing application (/) commands.')

        await rest
            .put(Routes.applicationCommands(Bun.env.CLIENT_ID), {
                body: []
            })
            .then(() => console.log('Cleared global commands'))

        await rest
            .put(Routes.applicationCommands(Bun.env.CLIENT_ID), {
                body: commands
            })
            .then(() =>
                console.log('Successfully reloaded application (/) commands.')
            )
    } catch (error) {
        console.error('Failed to reload application (/) commands.', error)
    }
}
