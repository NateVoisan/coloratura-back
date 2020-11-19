BEGIN;


TRUNCATE
    coloratura_tracks,
    coloratura_playlists,
    coloratura_users
    RESTART IDENTITY CASCADE;


INSERT INTO coloratura_users (user_name, password)
VALUES
    ('voob', 'pls-generate-password-here');


INSERT INTO coloratura_playlists (name, number_of_tracks, creator)
VALUES
    ('Groovy Jams', 5, 'voob'),
    ('Speed Beats', 8, 'voob');


INSERT INTO coloratura_tracks (link, playlist_id, title, artist)
VALUES
    ('www.youtube.com/watch=?1234567890', 1, 'The Beatles', 'Hey Jude');


COMMIT;