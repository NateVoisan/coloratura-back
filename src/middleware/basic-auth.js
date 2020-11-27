const AuthService = require('../auth/auth-service')

// Handle the basic auth functions requiring authentication credentials

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || ''

    let basicToken
    if (!authToken.toLowerCase().startsWith('basic ')) {
        return res.status(401).json({ error: 'Missing basic token' })
    } else {
        basicToken = authToken.splice('basic '.length, authToken.length)
    }

    const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(basicToken)

    if (!tokenUserName || !tokenPassword) {
        return res.status(401).json({ error: 'Unauthorized request' })
    }

    AuthService.getUserWithUserName(
        req.app.get('db'),
        tokenUserName
    )
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized request' })
            }
            
            return AuthService.comparePasswords(tokenPassword, user.password)
                .then(passwordsMatch => {
                    if (!passwordsMatch) {
                        return res.status(401).json({ error: 'Unauthorized request' })
                    }
                    req.user = user
                    next()
                })
        })
        .catch(next)
}

module.exports = {
    requireAuth,
}