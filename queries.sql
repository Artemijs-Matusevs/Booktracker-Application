----- USERS TABLE QUERIES -----
-- CREATE USERS TABLE --
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(10),
	pin NUMERIC(4, 0)
)

-- INSERT TEST USER DATA --
INSERT INTO users (username, pin)
VALUES ('tom', 1234)

-- ALTER USERS TABLE TO HAVE UNIQUE USERNAME --
ALTER TABLE users
ADD CONSTRAINT unique_username_constraint UNIQUE (username);

-- ALTER USERS TABLE TO STORE HASHED PASSWORDS --
ALTER TABLE users
ALTER COLUMN pin TYPE VARCHAR(100);




----- SAVED BOOKS -----
CREATE TABLE saved_books (
	id SERIAL PRIMARY KEY,
	book_notes VARCHAR(500),
	book_title VARCHAR(50),
	user_id INTEGER REFERENCES users(id)
);

-- INSERT TEST BOOKS DATA FOR USER 'tom' --
INSERT INTO saved_books (book_notes, book_title, user_id)
VALUES ('This is the notes of the book', 'This is the book title', 1);