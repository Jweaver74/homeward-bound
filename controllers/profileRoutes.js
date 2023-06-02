const router = require('express').Router();
const { User, Pet,Notification} = require('../models');
const withAuth = require('../utils/auth');

// GET /api/pets
router.get('/', withAuth, async (req, res) => {
    try {
        const petData = await Pet.findAll({
            where:{ user_id: req.session.user_id},
            include: [
                {
                    model: User,
                    attributes: ['username'],
                },
            ],
        });

        const userData = await User.findByPk(req.session.user_id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Pet }],
        });

       const notificationData = await Notification.findAll({
        where:{ 
            pet_owner: req.session.user_id,
        },
        include: [
        {
        model: Pet,
        attributes: ['name'],
        },
        ],
        });

const notifications = notificationData.map((n) => n.get({ plain: true }));
const pets = petData.map((pet) => pet.get({ plain: true }));
const user = userData.get({ plain: true });

res.render('profile', {
    user,
    pets,
    notifications,
    logged_in: req.session.logged_in,
});
} catch (err) {
    res.status(500).json(err);
}
});

router.get('/addPet', withAuth, async (req, res) => {
    console.log('test');
    const petData = req.session.user_id;
    res.render('addPet', { petData, loggedIn: req.session.loggedIn });
  });
  
  router.post('/addPet', withAuth, async (req, res) => {
    try {
      const newPet = await Pet.create({
        user_id: req.session.user_id,
        name: req.body.name,
        type: req.body.type,
        breed: req.body.breed,
        age: req.body.age,
        date_added: req.body.date_added,
        description: req.body.description,
        owner_name: req.body.owner_name,
        owner_phone: req.body.owner_phone,
        owner_email: req.body.owner_email,
        reward: req.body.reward,
      });
      const userPetData = await Pet.findAll({
        where: {
          user_id: req.session.user_id
        },
        include: {
          model: User,
          attributes: {
            exclude: ['password']
          }
        }
      });
      const pets = userPetData.map((pet) =>
        pet.get({ plain: true })
      );
      console.log(pets);
  
      res.render('profile', { pets, loggedIn: req.session.loggedIn });
  
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });

  router.get('/updatePet/:id', withAuth, async (req, res) => {
    try {
      const petData = await Pet.findByPk(req.params.id, {
        include: [
          {
            model: User,
            attributes: {
              exclude: ['password'],
            },
          },
        //   { model: Comment,
        //   include: [{
        //     model: User,
        //     attributes: ['username']
        //   }] },
        ],
      });
    
      const pets = petData.get({ plain: true });
      res.render('updatePet', { pets, loggedIn: req.session.loggedIn });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });

// GET /api/pets/:id
router.put('/updatePet/:id', withAuth, async (req, res) => {
    try {
      const petId = req.params.id;
      const updatedPetData = req.body;
  
      const [numAffectedRows] = await Pet.update(updatedPetData, {
        where: {
          id: petId,
        },
      });
  
      if (numAffectedRows === 0) {
        res.status(404).json({ message: 'No pet with this id!' });
        return;
      }
  
      res.status(200).json({ message: 'Pet Updated' });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });

router.delete('/deletePet/:id', withAuth, async (req, res) => {
    try {
      const petData = await Pet.destroy({
        where: {
          id: req.params.id,
          user_id: req.session.user_id,
        },
      });
  
      if (!petData) {
        res.status(404).json({ message: 'No pet found with this id!' });
        return;
      }
      
      res.status(200).json(petData);
    } catch (err) {
      console.log(err);
      res.status(500).json(err); 
    }
  });

module.exports = router;


       