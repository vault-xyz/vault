DROP TABLE IF EXISTS audio_book;

CREATE TABLE audio_book (
  id serial PRIMARY KEY,
  name VARCHAR(255),
  alternate_names VARCHAR(255)[],
  description VARCHAR(255),
  same_as INTEGER,
  abridged BOOLEAN,
  book_edition VARCHAR(255),
  isbn VARCHAR(255),
  number_of_pages INTEGER,
  disambiguating_description VARCHAR(255)
);

-- INSERT INTO audio_book (name, abridged, book_edition, isbn, number_of_pages, disambiguating_description, alternate_names, same_as)
-- VALUES
--    ('The Simpsons (AudioBook)',false, NULL, NULL, NULL, NULL, NULL, NULL);