INSERT INTO thelabyrinth (username, score, date)
VALUES (:username, :score, NOW())
ON DUPLICATE KEY UPDATE
    score = IF(VALUES(score) > score, VALUES(score), score),
    date = IF(VALUES(score) > score, NOW(), date);