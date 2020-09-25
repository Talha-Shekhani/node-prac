const express = require('../node_modules/express')
const bodyParser = require('../node_modules/body-parser')
const mongoose = require('mongoose')
const authenticate = require('../authenticate')
const Favorites = require('../models/favorites')
const cors = require('./cors')
const { db } = require('../models/favorites')

const favoriteRouter = express.Router()
favoriteRouter.use(bodyParser.json())

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200)
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({})
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                let fav = favorites.filter(item => item.user.equals(req.user._id))
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(fav)
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({})
            .then((favorites) => {
                console.log(favorites, favorites.length)
                if (favorites.length > 0) {
                    let fav = favorites.filter(item => item.user.equals(req.user._id))[0]
                    if (!fav) {
                        err = new Error(`Favorite not found`)
                        err.statusCode = 403
                        return next(err)
                    } else {
                        for (let i = 0; i < req.body.length; i++)
                            fav.dishes.push(req.body[i]._id)
                        fav.save()
                            .then((favorite) => {
                                Favorites.findById(favorite._id)
                                    .then((favorite) => {
                                        res.statusCode = 200
                                        res.setHeader('Content-Type', 'application/json')
                                        res.json(favorite)
                                    })
                            })
                    }
                } else {
                    err = new Error(`Favorite not found`)
                    err.statusCode = 403
                    return next(err)
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403
        res.end(`PUT operation not supported on /favorites`)
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.remove({})
            .then((resp) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(resp)
            }, (err) => next(err))
            .catch((err) => next(err))
    })

favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200)
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        // res.statusCode = 403
        // res.end(`GET operation not supported on /favorites/${req.params.dishId}`)
        // let user = new Favorites({ user: req.user._id })
        // res.json(user)
        Favorites.find({ user: req.user._id })
            .then((fav) => {
                res.json(fav)
            })
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({})
            .then((favorites) => {
                let fav = favorites.filter(item => item.user.equals(req.user._id))[0]
                if (favorites.length > 0 && fav) {
                    console.log(fav)
                    fav.dishes.push(req.params.dishId)
                    fav.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .then((favorite) => {
                                    res.statusCode = 200
                                    res.setHeader('Content-Type', 'application/json')
                                    res.json(favorite)
                                })
                        })
                } else {
                    Favorites.create({ user: req.user._id })
                        .then((favorite) => {
                            favorite.dishes.push(req.params.dishId)
                            favorite.save()
                                .then((favorite) => {
                                    Favorites.find({ user: req.user._id })
                                        .then((favorite) => {
                                            console.log('Favorite Added', favorite)
                                            res.statusCode = 200
                                            res.setHeader('Content-Type', 'application/json')
                                            res.json(favorite)
                                        })
                                })
                        }, (err) => next(err))
                        .catch((err) => next(err))
                }
            })

    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorites.findByIdAndUpdate(req.params.dishId, {
                $set: req.body
            }, { new: true })
            .then((favorite) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite)
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({})
            .then((favorite) => {
                // console.log(favorite.length)
                if (favorite.length > 0) {
                    let dish = []
                    let fav = favorite.filter(item => item.user.equals(req.user._id))[0]
                    if (fav) {
                        for (let i = 0; i < fav.dishes.length; i++) {
                            if (fav.dishes[i]._id.toString() != req.params.dishId.toString())
                                dish.push({ "_id": fav.dishes[i] })
                        }
                        fav.dishes = []
                        if (dish[0] != undefined)
                            fav.dishes.push(dish[0])
                        console.log(fav)
                        fav.save()
                            .then((favorite) => {
                                res.statusCode = 200
                                res.setHeader('Content-Type', 'application/json')
                                res.json(favorite)
                            })
                    }
                } else {
                    err = new Error(`Favorite with dish ${req.params.dishId} not found`)
                    err.statusCode = 403
                    return next(err)
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })

module.exports = favoriteRouter