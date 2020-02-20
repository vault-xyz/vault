DROP TABLE IF EXISTS genre;
CREATE TABLE genre (
  id serial PRIMARY KEY,
  name VARCHAR(255),
  value VARCHAR(255),
  description VARCHAR(255),
  same_as INTEGER
);

-- INSERT INTO genre (value, name)
-- VALUES
--    ('sports', 'Sports');