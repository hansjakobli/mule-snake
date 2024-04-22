# Mule Snake

This game is a rebuild of the great original.
Rebuild code from RabiRoshan (https://github.com/RabiRoshan/snake_game) with my own bugfixes, restyling and functionality expansions.

## How to play
Visit this page https://mule-snake.com/. Use the arrow keys to control the snake.

## Options
Note: You cannot specify both `event` and `timer` at the same time.

### Timer
You can limit the playing time by setting the `timer` query parameter. Units in seconds. E.g. use https://mule-snake.com/?timer=120 to set a 2 minute deadline.

### Leaderboard
The game comes with a leaderboard by default. The leaderbaord also defines a timer such that all players on the leaderboard play under the same conditions. So, if you specify a `timer`, then the leaderboard is automatically disabled.
By default the timer is 0 (unlimited).

### Event-specific leaderboards
It's possible to create a leaderboard dedicated to an event, in this case specify the `event` as a query parameter (e.g.: https://mule-snake.com/?event=myevent). Note that the `event` together with the corresponding timer will need to be created in the DB beforehand.