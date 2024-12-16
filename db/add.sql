INSERT INTO leaderboard (username, score, date)
VALUES (:username, :score, NOW())
ON DUPLICATE KEY UPDATE
    score = VALUES(score),
    date = NOW();
