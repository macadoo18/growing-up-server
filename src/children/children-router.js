require('dotenv').config();
const express = require('express');
const path = require('path');
const ChildrenService = require('./children-service');
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cloudinary = require('cloudinary').v2;

const childrenRouter = express.Router();

childrenRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        const db = req.app.get('db');
        const user_id = req.user.id;

        ChildrenService.getByUserId(db, user_id)
            .then((children) => {
                res.json(children.map(ChildrenService.serializeChildren));
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const db = req.app.get('db');

        const { first_name, age, weight } = req.body;
        const newChildren = {
            first_name,
            age,
            user_id: req.user.id,
            weight
        };
        
        for (const [key, value] of Object.entries(newChildren))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                });

        ChildrenService.insertChildren(db, newChildren)
            .then((child) => {
                res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${child.id}`))
                    .json(ChildrenService.serializeChildren(child));
            })
            .catch(next);
    });

childrenRouter
    .route('/:childId')
    .all(requireAuth, jsonParser, (req, res, next) => {
        const db = req.app.get('db');
        const child_id = req.params.childId;

        ChildrenService.getById(db, child_id)
            .then((child) => {
                if (!child) {
                    return res.status(404).json({
                        error: { message: 'Child does not exist' }
                    });
                }
                res.child = child;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.json(ChildrenService.serializeChildren(res.child));
    })
    .delete((req, res, next) => {
        const db = req.app.get('db');

        const id = req.params.childId;
        ChildrenService.deleteChildren(db, id)
            .then(res.status(204).end())
            .catch(next);
    })
    .patch((req, res, next) => {
        const db = req.app.get('db');
        const { first_name, age, weight, image } = req.body;
        const child_id = req.params.childId;
        const updatedChildren = {};

        if (first_name) {
            updatedChildren.first_name = first_name;
        }

        if (age) {
            updatedChildren.age = age;
        }

        if (weight) {
            updatedChildren.weight = weight;
        }

        if (image) {
            updatedChildren.image = image;
        }

        const values = Object.values(updatedChildren).length;
        if (values === 0) {
            return res.status(400).json({
                error: { message: `Request body must contain value to update` }
            });
        }

        ChildrenService.updateChildren(db, child_id, updatedChildren)
            .then((child) => {
                res.status(200).json(ChildrenService.serializeChildren(child));
            })
            .catch(next);
    });

module.exports = childrenRouter;
