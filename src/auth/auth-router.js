const express = require('express');
const AuthService = require('./auth-service');
const { requireAuth } = require('../middleware/jwt-auth');

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter.post('/signin', jsonBodyParser, (req, res, next) => {
        const { user_name, password } = req.body;
        const signInUser = { user_name, password };

        for (const [key, value] of Object.entries(signInUser))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })

        AuthService.getUserWithUserName(
            req.app.get('db'),
            signInUser.user_name
        )
            .then(dbUser => {
                if (!dbUser)
                    return res.status(400).json({
                        error: 'Incorrect user_name or password',
                    })

                return AuthService.comparePasswords(signInUser.password, dbUser.password)
                    .then(compareMatch => {
                        if (!compareMatch)
                            return res.status(400).json({
                                error: 'Incorrect user_name or password',
                            })

                        const sub = dbUser.user_name
                        const payload = { user_id: dbUser.id }
                        res.send({
                            authToken: AuthService.createJwt(sub, payload)
                        })
                    })
            })
            .catch(next);
    });

authRouter.post('/refresh', requireAuth, (req, res) => {
    const sub = req.user.user_name;
    const payload = { user_id: req.user.id };
    res.send({
        authToken: AuthService.createJwt(sub, payload)
    });
});

module.exports = authRouter;