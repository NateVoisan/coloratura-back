CREATE TABLE coloratura_playlists (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    number_of_tracks NUMERIC
);