DROP TABLE IF EXISTS show;

CREATE TABLE show (
  id serial PRIMARY KEY,
  name VARCHAR(255),
  alternate_names VARCHAR(255)[],
  description VARCHAR(255),
  same_as INTEGER
);

-- INSERT INTO show (name, description)
-- VALUES
--    ('The Simpsons','A family show.');