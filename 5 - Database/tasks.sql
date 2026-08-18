create table users (
	id BIGSERIAL not null PRIMARY key,
	email VARCHAR(150),
	hash_password VARCHAR(255)
);

create table tasks (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	title TEXT NOT NULL,
	completed BOOLEAN NOT NULL DEFAULT false,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	user_id bigint not null references users(id)
);
insert into tasks (user_id ,title) values (1, 'VP Quality Control');
insert into tasks (user_id, title) values (2, 'Design Engineer');
insert into tasks (user_id, title) values (3, 'Community Outreach Specialist');
insert into tasks (user_id, title) values (4, 'Staff Scientist');
insert into tasks (user_id, title) values (5, 'Food Chemist');
insert into tasks (user_id, title) values (2, 'Statistician III');
insert into tasks (user_id, title) values (1, 'Dental Hygienist');
insert into tasks (user_id, title) values (4, 'Pharmacist');
insert into tasks (user_id, title) values (2, 'Health Coach III');


insert into users (email, hash_password) values ( 'kfeldbrin0@jalbum.net', '$2a$04$JIE4wOZ2J.OEvEi..DA1fesZJVW6C6bjq3L5ZsHoHCWUoWTWuMLMa');
insert into users ( email, hash_password) values ( 'jbuttel1@wikia.com', '$2a$04$caXVtwFH9.Z8fV2Bffy73eSnuylP7F37Ve4pW9kWeAtlEMGdTHVke');
insert into users ( email, hash_password) values ( 'bsiddele2@phpbb.com', '$2a$04$S4wG/t8qhQOEX6AUGt795.I3y7.zqxrW2EZE79QAcniGeVxuYveo.');
insert into users ( email, hash_password) values ( 'lfazakerley3@oracle.com', '$2a$04$KMfUsW6vlfVFKCvurEc1SedBGJ5/XtOihm/tjRpaZchEQf.oVQnza');
insert into users ( email, hash_password) values ( 'pbuntain4@gmpg.org', '$2a$04$L3qHtxmWc5FH2TRey/olH.DTIqwK7JGdnCntdOqFAZk7s2SMpeCNe');