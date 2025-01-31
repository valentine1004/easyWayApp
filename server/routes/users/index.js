const router = require('express').Router();
const User = require('../../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {registerValidation, loginValidation} = require('../../validation');

router.post('/register', async (req, res) => {
    
    const {error} = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const emailExist = await User.findOne({email: req.body.email});
    if (emailExist) return res.status(400).send('Email already exists');

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
        phone: req.body.phone,
        location: req.body.location,
        area: req.body.area,
        role: req.body.role,
        schedule: req.body.schedule,
        description: req.body.description,
        doctorId: req.body.doctorId
    });

    try {
        await user.save();
        res.send({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                area: user.area,
                role: user.role,
                schedule: user.schedule,
                description: user.description,
                doctorId: user.doctorId
            }
        });
    } catch (err) {
        res.status(400).send(err)
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    
    const {error} = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).send('Email is not found');

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Invalid password');

    // create token
    const token = jwt.sign({_id: user._id}, "test");
    res.header('auth-token', token).send({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            area: user.area,
            role: user.role,
            schedule: user.schedule,
            description: user.description,
            doctorId: user.doctorId
        },
        token: token
    });
});

// Find User in DB
router.post('/auth', async (req, res) => {
    const userId = req.body.id;

    await User.findById(userId, (error) => {
        if (error) {
            return res.status(400).send(error.message);
        } else {
            res.send('User are required');
        }
    });
});

router.post('/search', async (req, res) => {
    const users = await User.find(req.body);
    if (!users) return res.status(400).send('Users is not found');
    res.send(users);
})

module.exports = router;
