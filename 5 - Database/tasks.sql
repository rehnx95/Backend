create table tasks (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	user_id INT NOT NULL,
	title TEXT NOT NULL,
	completed BOOLEAN NOT NULL DEFAULT false,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
insert into tasks (user_id, title) values (91, 'VP Quality Control');
insert into tasks (user_id, title) values (727, 'Design Engineer');
insert into tasks (user_id, title) values (684, 'Community Outreach Specialist');
insert into tasks (user_id, title) values (225, 'Staff Scientist');
insert into tasks (user_id, title) values (242, 'Food Chemist');
insert into tasks (user_id, title) values (11, 'Statistician III');
insert into tasks (user_id, title) values (966, 'Dental Hygienist');
insert into tasks (user_id, title) values (121, 'Pharmacist');
insert into tasks (user_id, title) values (831, 'Health Coach III');
