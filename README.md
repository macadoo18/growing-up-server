# Growing Up Server

This is the api for our capstone project, called Growing Up.

## Live App

Deployed App: https://growing-up.vercel.app/
Please feel free to check out our app! We have set up a test user account and password.
    - username: test_user
    - password: Pass5555

## Summary

Growing up is the app that grows with your family. It allows parents to easily track and monitor their child's eating and sleeping habits. Parents can start new feeding and sleeping sessions, add details about how well they slept or what they at, and see a list of last sessions and their details. 

## Technology Used

Front End: HTML, CSS, JavaScript, React
<br />
Back End: Node, Express, PostresSQL

## API Documentation

### Authentication

GrowingUp uses JWT tokens, required on the children, eating, and sleeping endpoint requests. The tokens are created upon a users login and sent in the response body. All protected endpoints pull user_id from the JWT token give at login, and only return data specific to that user.

# API Endpoints:

## '/'

-   This endpoint allows you to test your connection to the server. It will send a response containing 'The good stuff' if you have connected sucessfully. It is not protected.

## /api/users endpoint:

### POST '/'

required:

-   first_name (string)
-   last_name (string)
-   username (string)
    -   must be unique
-   password (string)
    -   must include:
        -   at least 8 and less than 72 characters
        -   can't start with or end with spaces
        -   at least 1 uppercase, 1 lowercase, and 1 number

returns 201 adding user to the database

## /api/auth endpoint

### POST '/login'

required:

-   username (string)
-   password (string)

returns JWT

## /api/children endpoints:

### GET '/'

returns all children for a specific user

### POST '/'

required:

-   first_name (string)
-   age (integer)
optional:
-   weight (string - decimal type: max three place before decimal, must go to two places after decimal)

returns 201 adding child to the database

### GET '/:childId'

required:

-   childId, passed as a string parameter

returns specific child data

### DELETE '/:childId'

required:

-   childId, passed as a string parameter

removes specific child from database

### PATCH '/:childId'

required:

-   childId, passed as a string parameter
-   change at least 1 value for first_name, weight, image, or age
    -   weight (string - decimal type: max three place before decimal, must go to two places after decimal)

returns the updated child

## /api/eating endpoints:

### GET '/all/:childId'

required:

-   childId, passed as a string parameter
    returns all meal data for a specific child

### POST '/all/:childId'

required:

-   childId - passed as a string parameter
-   duration (time)
-   food_type (enum: 'bottle', 'breast_fed', 'formula')
    optional:
-   side_fed (string)
-   notes (string)

returns meal data created

### DELETE '/:mealId'

required:

-   mealId, passed as a string parameter
    removes specific meal from database

### PATCH '/:mealId'

required:

-   childId, passed as a string parameter
-   one of the values (notes, duration, food_type, side_fed) must be changed

returns 201 and updates

## /api/sleeping endpoints:

### GET '/all/:childId'

required:

-   childId, passed as a string parameter
    returns all sleep data for a specific child

### GET '/:sleepId'

required:

-   sleepId, passed as a string parameter
    returns sleep data for a specific child

### POST '/all/:childId'

required:

-   childId, passed as a string parameter
-   duration (time)
-   sleep_type (enum: 'crying','restless','calm')
-   sleep_category (enum: 'nap','bedtime')
    optional:
-   notes (string)

returns new sleep data

### DELETE '/:sleepId'

required:

-   sleepId, passed as a string parameter
    removes specific sleep data from database

### PATCH '/:sleepId

required:

-   sleepId, passed as a string parameter
-   one of the values (notes, duration, sleep_type, sleep_category) must be changed

returns 201 and updates

## Screenshots
