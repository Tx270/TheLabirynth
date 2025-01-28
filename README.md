# The Labyrinth Game

The Labyrinth is a web-based maze game where players navigate through multiple stages of mazes as quickly as possible.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Features](#features)
- [Future Development](#future-development)
- [Acknowledgements](#acknowledgements)

## Technologies Used

- **HTML/CSS/JS** - For the base of the web game.
- **PHP** - For server-side logic and db access.
- **MySQL** - For storing leaderboard scores.

## Features

- **Player Movement** - Players can navigate through the maze using standard wsad/arrows controls. They can also use bombs to destroy one wall per level.
- **Maze Generation** - The game uses the recursive division method to create random mazes for each level. The `MazeBuilder` class handles the creation of the maze layout.
- **Leaderboard** - The game tracks the time taken by each player to complete the maze and stores the scores in a MySQL database. The leaderboard displays the top scores.

## Config file

Db, language and max stage info is stored in /php/config.php:
````php
<?php
return [
    'DB_HOST' => '',
    'DB_NAME' => '',
    'DB_USER' => '',
    'DB_PASS' => '',
    'DB_CHARSET' => '',
    'BASE_URL' => '',
    'DEF_LANG' => '',
    'MAX_STAGE' => 8,
];
````

## Future Development

We are now working on adding multiplayer through [Pusher](https://pusher.com/). Check out the progress in the multiplayer branch.

## Acknowledgements

Thanks to the voluntary stress testers who fearlessly brake this game time after time:

- [ArtiChaos](https://github.com/ArtiFact-Code)
- [Marcelunio](https://github.com/Marcelunio)

These are the libraries and tools used in this project:

- [MazeBuilder Class](https://www.the-art-of-web.com/javascript/maze-generator/) for generating the maze.
- [js-cookie](https://github.com/js-cookie/js-cookie) for easier cookies menagment.
- [mousetrap](https://github.com/ccampbell/mousetrap) for easier key binding.
