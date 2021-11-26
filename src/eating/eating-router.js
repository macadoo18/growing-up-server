const express = require('express');
require('dotenv').config();
const path = require('path');
const EatingService = require('./eating-service');
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const moment = require('moment');

const eatingRouter = express.Router();

eatingRouter
    .route('/all/:childId')
    .get(requireAuth, jsonParser, (req, res, next) => {
        const id = req.params.childId;
        const db = req.app.get('db');

        EatingService.getByChildId(db, id)
            .then((childMeals) => {
                res.json(childMeals.map(EatingService.serializeMeal));
            })
            .catch(next);
    })
    .post(requireAuth, jsonParser, (req, res) => {
        const { notes, duration, food_type, side_fed, date } = req.body;
        const db = req.app.get('db');
        const newMeal = {
            child_id: req.params.childId,
            notes,
            date,
            duration,
            food_type,
            side_fed
        };
        
        const requiredValues = { duration, food_type };

        for (const [key, value] of Object.entries(requiredValues))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                });

        EatingService.insertMeal(db, newMeal).then((meal) => {
            res.status(201)
                .location(path.posix.join(req.originalUrl, `/${meal.id}`))
                .json(EatingService.serializeMeal(meal));
        });
    });

eatingRouter
    .route('/:mealId')
    .all(requireAuth, jsonParser, (req, res, next) => {
        const db = req.app.get('db');

        const meal_id = req.params.mealId;

        EatingService.getById(db, meal_id)
            .then((meal) => {
                if (!meal) {
                    return res.status(404).json({
                        error: { message: 'Meal does not exist' }
                    });
                }
                res.meal = meal;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.json(EatingService.serializeMeal(res.meal));
    })
    .delete((req, res, next) => {
        const db = req.app.get('db');

        const id = parseInt(req.params.mealId);
        EatingService.deleteMeal(db, id)
            .then(res.status(204).end())
            .catch(next);
    })
    .patch((req, res, next) => {
        const db = req.app.get('db');

        const id = req.params.mealId;
        const { notes, duration, food_type, side_fed } = req.body;

        const editedMeal = {
            notes,
            duration,
            food_type,
            side_fed
        };

        const values = Object.values(editedMeal).filter(Boolean).length;
        if (values === 0) {
            return res.status(400).json({
                error: { message: `Request body must contain value to update` }
            });
        }

        EatingService.updateMeal(db, id, editedMeal)
            .then(res.status(201).end())
            .catch(next);
    });

module.exports = eatingRouter;
