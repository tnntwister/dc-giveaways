# Discord Giveaways

Code for a small bot to manage giveaways.

## Available commands

you can manage giveaways with custom commands : 

- **setGiveway** `id` `summary` : create or update the giveaway member list
- **giveaway**  `id` : launch a giveaway roll
- **lastGiveaway**  `id` : recall the last winner for a giveaway
- **listSubscribers** `id` : list the members subscribed to giveaway
- **listWinners** `id` : list the winners subscribed to giveaway
- **listAttendees** `id` : list the subscribers to giveaway that can win to the next giveaway

🔔 Be careful : the id is unique, but if you mispelled it you will create another giveaway list. 

## How you should use it

1. Create the new giveaway with a unique id

for example 
`/set-giveaway march-2024-treasure Win a fabulous prize` 

2. launch a giveway with this id

for example 
`/giveaway march-2024-treasure` 

3. Anyone can know anytime who is the last winner with the last-giveaway command

`/last-giveaway march-2024-treasure` 

🎮 all commands should be available in your discord prompt once the bot is activated, appearing when you are typing a slash in your chat input. 

## How to install it in your discord server

You'll need : 
- a PostgreSQL database. 
- a NodeJs server, able to run services

1. Populate your PG database with the dump found at /documentation/postgre.sql
2. clone the repository
3. Configure your Discord Developer App 
4. copy .env.example to .env, and fill all values
5. declare a service on your service with the command `node <path>/src/index.js`
6. install the bot in your serveur integrations. 


