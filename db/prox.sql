WITH posortowane AS (
    SELECT ROW_NUMBER() OVER (ORDER BY score DESC) AS place, username, score, date
    FROM thelabyrinth
),
plc AS (
    SELECT place 
    FROM posortowane 
    WHERE username = :username
),
lst AS (
    SELECT MAX(place) AS place 
    FROM posortowane
),
granice AS (
    SELECT 
        CASE 
            WHEN (SELECT place FROM plc) + 1 = (SELECT place FROM lst) THEN (SELECT place FROM plc) - 4
            WHEN (SELECT place FROM plc) = (SELECT place FROM lst) THEN (SELECT place FROM plc) - 5
            WHEN (SELECT place FROM plc) < 9 THEN 0
            ELSE (SELECT place FROM plc) - 3
        END AS start_place,
        (SELECT place FROM plc) + 
        CASE 
            WHEN (SELECT place FROM plc) < 9 THEN (10 - (SELECT place FROM plc)) 
            ELSE 2 
        END AS end_place
),
wynik AS (
    SELECT place, username, score, date
    FROM posortowane
)
SELECT * 
FROM wynik, granice
WHERE place BETWEEN granice.start_place AND granice.end_place;
