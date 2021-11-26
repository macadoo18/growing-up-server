BEGIN;

TRUNCATE
  sleeping,
  eating,
  children,
  users
  RESTART IDENTITY CASCADE;

INSERT INTO users (first_name, last_name, username, password)
    VALUES
        ('test', 'user', 'test_w', '$2a$08$LS8WQoWCBZ6EroHTaugApu0bonkqYS5eUIE2MRNfEwxs155RCV.EW'),
        ('other', 'person', 'other_test', '$2a$08$/Um1un/BUFR6pAvBbeMToekN1WOWBfMtUzvRn3WGiKf/MdM/qPIpW');

INSERT INTO children (first_name, image, weight, age, user_id)
    VALUES
        ('liam', 'https://images.unsplash.com/photo-1578668577946-2f84638d344f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', '19.6', '9', 1),
        ('emma', 'https://images.unsplash.com/photo-1557939574-a2cb399f443f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80', '22.2', '12', 1),
        ('olivia','https://images.unsplash.com/photo-1583086762675-5a88bcc72548?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1352&q=80','10', '4', 2);

INSERT INTO eating (notes, duration, food_type, side_fed, child_id)
    VALUES
        ('testing notes - good eating', '00:28:12', 'bottle', '', 2),
        ('didnt eat well', '00:12:56', 'breast_fed', 'left', 3),
        ('', '00:34:35', 'formula', '', 2),
        ('', '00:37:22', 'formula', '', 1),
        ('good session', '00:45:23', 'breast_fed', 'right', 3);

INSERT INTO sleeping (notes, duration, sleep_type, sleep_category, child_id)
    VALUES
        ('stomach', '02:34:55', 'calm', 'nap', 2),
        ('rolled over three times', '04:55:08', 'restless', 'bedtime', 3),
        ('', '03:45:36', 'crying', 'bedtime', 1);

COMMIT;