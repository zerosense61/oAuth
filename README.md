How to set up

1. Fork this
2. Make a Microsoft Azure Application Registration
2. Make a Microsoft Azure Application Registration https://portal.azure.com/
   2.0 create a new app registration
       2.1 name it whatever you want 
       2.2 Personal Microsoft accounts only
       2.3 link your heruko application
3. Configure in index.js
   3.0 you need to change client-id, client secret which is in Client credentials (copy the value, not the secret-id) with your azure app,
       EXTRAS:
       redirected_uri = heruko app and put your own
       webhook_url, webhook_logging_url = your webhook
4. Host the forked repostry which you edited on Heroku ( or anything else )
   4.0 connect heruko with your github repository and deploy
5. ( Not compulsory ) get a custom dns
6. Set up your own discord server ( https://media.discordapp.net/attachments/1031890637731139604/1031935541266100335/unknown.png?width=1229&height=694 )

Some tools to set up your discord server:
DISCORD: https://discord.gg/cB2eEKUCnD

Some tools to set up your discord server:
 https://namecheap.com - free domain + very cheap domains
 https://old.message.style/dashboard - embed generator 
 https://Tokenu.net - discord botting

Todo:
 1. Remove the useless logging shit
