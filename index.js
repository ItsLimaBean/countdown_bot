require("dotenv").config();
process.env.TZ = "America/Vancouver"
const { REST, Routes, Client, GatewayIntentBits } = require("discord.js");
const schedule = require("node-schedule");

const commands = [
    {
        name: "classdone",
        description: "Marks Math class as done."
    },
    {
        name: "fandrew",
        description: "Does a thing..."
    }
]

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });


(async () => {
    try {
        let countdown;
        console.log("Started refreshing application (/) commands.");

       await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

        console.log("Successfully reloaded application (/) commands.");
    
        client.on("ready", () => {
            console.log("Logged in as " + client.user.tag);
            console.log("Target channel id: " + process.env.TARGET)
        });
        
        client.on("interactionCreate", async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
        
            if (interaction.commandName === "classdone") {
                clearInterval(countdown);
                await interaction.reply("Marked math as done.");
            } else if (interaction.commandName === "fandrew") {
                await interaction.reply("Fuck you Top G");
            }
        });

        const rule = new schedule.RecurrenceRule();
        rule.tz = "America/Vancouver";
        rule.second = 0;
        rule.minute = 30;
        rule.hour = 13;
        rule.dayOfWeek = 5;

        schedule.scheduleJob(rule, async () => {
            console.log("Class has started.");
            const targetChannel = client.channels.cache.get(process.env.TARGET);
            await targetChannel.send("The countdown begins...");
            const end = new Date();
            end.setHours(12 + 4);
            end.setMinutes(20);
            end.setSeconds(0);
            countdown = setInterval(async () => {
                const now = new Date().getTime();
                const diffMs = end - now;

                const hoursMS = diffMs / (60 * 60 * 1000);
                let hours = hoursMS < 0 ? Math.ciel(hoursMS) : Math.floor(hoursMS);
                const minutes = Math.round(diffMs / (60 * 1000)) % 60;

                if (hours > 0) {
                    await targetChannel.send(minutes === 0 ? `Math ends in ${hours+1} hour(s).` : `Math ends in ${hours} hour(s) and ${minutes} minute(s).`);
                } else if (hours == 0 && minutes > 0) {
                    await targetChannel.send(`Math ends in ${minutes} minute(s)!`);
                } else if (hours == 0 && minutes == 0) {
                    await targetChannel.send(`**Math should be over!!!**`);
                } else if (hours == 0 && minutes < 0) {
                    await targetChannel.send(`Math has gone over by ${Math.abs(minutes)} minute(s)`);
                } else if (hours < 0) {
                    await targetChannel.send(minutes === 0 ?  `Math has gone over by ${Math.abs(hours+1)} hour(s) :(` : `Math has gone over by ${Math.abs(hours)} hour(s) and ${Math.abs(minutes)} minute(s) :(`);
                } else {
                    await targetChannel.send("liam broke something :)");
                }

                console.log(`${hours} ${minutes}`);
            }, 60 * 1000);
        });

        client.login(process.env.BOT_TOKEN);
    } catch (error) {
        console.error(error);
    }
})();


