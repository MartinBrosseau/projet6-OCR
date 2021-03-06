//Ce fichier comporte toute la logique métier concernant les utilisateurs(inscription et connection)
require('dotenv').config();
const bcrypt = require('bcrypt');//Bcrypt sert a hasher les mdp afin de les sécuriser
const User = require('../models/user');//On import notre model User
const jwt = require('jsonwebtoken');//Jsonwebtoken attribue un token a un utilisateur lorsqu'il se connecte
const TOKEN = process.env.TOKEN;


//Création d'un nouvel utilisateur
exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)//On hash le mot de passe pour des raison de sécrutité(Ici on fait 10 "tour" de l'algorythme pour hash le mot de passe)
    .then(hash => {//Puis on crée un nouvel utilisateur avec notre model mongoose
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()//On sauvegarde l'utilisateur dans la base
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));  
};


//Connection d'un utilisateur existant
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })//On vérifie si l'email saisie est présent dans la base
    .then(user => {
      if (!user) {//Si on ne trouve pas l'utilisateur
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)//On utilise bcrypt pour comparer les hash et voir s'ils proviennent de la même chaine de caractère
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({//On attrivue un token valable 24H a tout utilisateur qui se connecte
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              `${TOKEN}`,
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};