require('dotenv').config();
const express = require('express');
const path = require('path');
const SleepingService = require('./sleeping-service');
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const SleepingServcie = require('./sleeping-service');

const sleepingRouter = express.Router();

sleepingRouter
    .route('/all/:childId')
    .all(requireAuth)
    .get((req, res, next) => {
        const db = req.app.get('db');
        const id = parseInt(req.params.childId);

        SleepingService.getByChildId(db, id)
            .then((childSleep) => {
                res.json(childSleep.map(SleepingService.serializeSleep));
            })
            .catch(next);
    })

    .post(requireAuth, jsonParser, (req, res) => {
        const db = req.app.get('db');

        const { notes, duration, sleep_type, sleep_category, date } = req.body;
        const newSleep = {
            child_id: req.params.childId,
            notes,
            date,
            duration,
            sleep_type,
            sleep_category
        };

        const requiredValues = { duration, sleep_type, sleep_category };

        for (const [key, value] of Object.entries(requiredValues))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                });

        SleepingService.insertSleep(db, newSleep).then((sleep) => {
            res.status(201)
                .location(path.posix.join(req.originalUrl, `/${sleep.id}`))
                .json(SleepingService.serializeSleep(sleep));
        });
    });

sleepingRouter
    .route('/:sleepId')
    .all(requireAuth, jsonParser, (req, res, next) => {
        const db = req.app.get('db');

        const sleep_id = req.params.sleepId;

        SleepingServcie.getById(db, sleep_id)
            .then((sleep) => {
                if (!sleep) {
                    return res.status(404).json({
                        error: { message: 'Sleep instance does not exist' }
                    });
                }
                res.sleep = sleep;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.json(SleepingServcie.serializeSleep(res.sleep));
    })
    .delete((req, res, next) => {
        const db = req.app.get('db');

        const id = req.params.sleepId;
        SleepingService.deleteSleep(db, id)
            .then(res.status(204).end())
            .catch(next);
    })
    .patch((req, res) => {
        const db = req.app.get('db');
        const id = req.params.sleepId;
        const { notes, duration, sleep_type, sleep_category } = req.body;

        const editedSleep = {
            notes,
            duration,
            sleep_type,
            sleep_category
        };

        const values = Object.values(editedSleep).filter(Boolean).length;
        if (values === 0) {
            return res.status(400).json({
                error: { message: `Request body must contain value to update` }
            });
        }

        SleepingService.updateSleep(db, id, editedSleep).then(
            res.status(201).end()
        );
    });

module.exports = sleepingRouter;
