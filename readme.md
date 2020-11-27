# Coloratura


## Live Link:

https://coloratura-front.vercel.app/


### Github Repositories

Client --- https://github.com/NateVoisan/coloratura-front
Server --- https://github.com/NateVoisan/coloratura-back


### Summary

The purpose of this application is to allow users to create an account then create a playlist and add tracks to it. When adding tracks the user is asked to provide a link, title, and artist. The page will populate with the given data and show a container with the tracks information. At the top of the page a media player will appear correlating to the first track in the list. The media can be changed by simply clicking on a different track container. If the media type is supported(Youtube or Bitchute at the moment) it will show the media player, however, if the media type is not supported yet(Soundcloud, Spotify, and Vimeo are coming soon) it will display an error message. All user, playlist and track data are saved into a database for use later on. Overall this application is used to curate your own playlist using many different types of media sites and allowing the user to store their playlist in one easy to use place.


### Screenshots



### Demo Account Details:

Username: testuser01
Password: testuser01


### Functionality

- Users are able to create an account
- Registered users are able to sign in and out of their account anytime
- Signed in users are able to create and save playlists
- Signed in users are able to create and save tracks to playlists


### Technology

#### Front End
- React
    - HTML5
    - CSS3
    - JavaScript ES6

- Testing
    - Jest

- Production
    - Deployed via Vercel


#### Back End
- Node and Express
    - Authentication via JWT
    - RESTful API

- Testing
    - Supertest
    - Mocha and Chai

- Database
    - Postgres
    - Knex.js

- Production
    - Deployed via Heroku


### Component Structure

- index.js
    - App.js
        - Home.js
        - Header.js
            - SignUp.js
            - SignIn.js
        - PlaylistList.js
            - CreatePlaylist.js
        - Playlist.js
            - Playlistitem.js
            - YTMedia.js
            - BCMedia.js
        - Utils.js


### Database Structure

- Users
    - id
    - user_name
    - password

- Playlists
    - id
    - name
    - creator

- Tracks
    - id
    - link
    - title
    - artist
    - playlist_id


### API Documentation

/auth
└──GET
    └──/:id
└──POST
    ├──/
    ├──/refresh
    ├──/signin
/playlists
└──GET
    ├──/
    ├──/:playlist_id
    ├──/:playlist_id/tracks
└──POST
    ├──/create/new
└──DELETE
    ├──/deleteplaylist/:playlist_id
    ├──/deletetrack/:trackId
/users
└──GET
    ├──/:id
└──POST
    ├──/
/tracks
└──POST
    ├──/


### Development Roadmap

This is v1.0 of the app, but more functionality wil be added in the future:
- Ability to edit track position in playlist
- Supports all media types
- Plays through media links and jumps to the next one in the list when finished
- Login authentication for services such as Spotify
- Changes to the style layout of each page


### How to run

Use command line to navigate into the project folder and run the following commands

- Local React Scripts
    - npm install --- installs the react project
    - npm start --- runs React on port 3000
    - npm run test --- runs tests

- Local Node Scripts
    - npm install --- installs the node project
    - npm run migrate --- migrates the database
    - npm run dev --- runs the Node server on port 8000
    - npm run test --- runs tests