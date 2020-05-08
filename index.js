const express = require('express');
const app = express();
const port = 5004;

////////////
//MongoDB
////////////
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
// Connection URL
const url = 'mongodb+srv://ashish:ashadi97@customer-database-i9hsu.mongodb.net/test?retryWrites=true&w=majority';

// Database Name

// Use connect method to connect to the server
// MongoClient.constructor({useUnifiedTopology: true});
let mongoConnection = MongoClient.connect(url,);



let undoValue = undefined;

let bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(cookieSession({
    name: 'session',
    secret: 'ashish',
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

let customers = [];

app.listen(port, async () => {
    mongoConnection = await MongoClient.connect(url,);
    console.log(`Running on port ${port}`);
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");

    next();
});


app.get('/', (req, res) => {
    res.send('Hey there');
});

app.get('/customers',async (req, res) => {
    console.log(req.session.userId, 'session Id');
    let data = await (mongoConnection.db('forms').collection('customers').find({owner: req.session.userId}).toArray());
    data = await data.filter(e => e.active);
    if(req.session.userId !== undefined) {
        res.send(data);
    }
    else {
        res.status(403).send;
        res.send([]);
    }
});

app.get('/customers/:id', (req, res) => {
    console.log('requested id: ', req.params.id);
    let temp = customers.find(e => e._id === req.params.id);
    if (temp !== undefined)
    res.send(temp);
    else res.send('Customer not found');
});

app.post('/customer/delete/:id', async (req, res) => {
    let database = mongoConnection.db('forms').collection('customers');
    // let query = (database.find({ "_id": ObjectId(req.body.id.toString())}));
    console.log('id for delete: ', req.body.id);
    // let targetIndex = customers.findIndex(e => e._id === req.body.id);
    let result = await database.findOneAndUpdate({"_id": ObjectId(req.body.id)},
        {$set:{active: false}}
    )
    console.log('Deactivated item is : ', result.value._id);
    res.send({id: result.value._id})
});

app.post('/customer/undoDelete',async (req, res) => {
    console.log('undoing changes');
    let database = mongoConnection.db('forms').collection('customers');
    let result = await database.findOneAndUpdate({"_id": ObjectId(req.body.id)},
        {$set:{active: true, deleting: false}}
    );
    res.send({userRestored: result.value});
    console.log('Response sent:', result.value);
    undoValue = undefined;
});

app.post('/customer/add', async (req, res) => {
    console.log('Login id is:', req.session.userId);
    let temp = {
        name: req.body.name,
        number: req.body.number,
        gender: req.body.gender,
        deleting: false,
        active: true,
        timeCreated: new Date().getTime(),
        owner: req.session.userId,
    };
    console.log('Inside add');
    let a = await mongoConnection.db('forms').collection('customers').insertOne(temp,);
    console.log('Customer id generated is: ', a.insertedId);

    customers.push(temp);
    res.send({_id: a.insertedId});
});

app.post('/signUp', async (req, res) => {
    let hash = bcrypt.hashSync(req.body.password, 10);
    let temp = {
        email: req.body.email,
        password: hash,
    };
    console.log('Entered signUp with', req.body);
    let userExist = await mongoConnection.db('user-database').collection('users').findOne({email: req.body.email});
    console.log(userExist, 'here');
    if(userExist !== null){
        res.status.set(403);
        res.send({_id: undefined});
        return;
    }
    let user = await mongoConnection.db('user-database').collection('users').insertOne(temp);
    console.log('User id generated is: ', user.insertedId);
    req.session.userId = user.insertedId;
    customers.push(temp);
    res.send({_id: user.insertedId});
})

app.post('/login', async (req, res) => {
    console.log('Entered login with', req.body);
    let temp = {
        email: req.body.email,
        password: req.body.password,
    };

    let user = await mongoConnection.db('user-database').collection('users').findOne({"email": (req.body.email)});
    console.log(user);
    if(user !== undefined) {
        console.log('User found with id: ', user);

        if(bcrypt.compareSync( req.body.password, user.password)) {
            req.session.userId = user._id;
            console.log('Login id is:', req.session.userId);
            res.send({_id: user._id});
        }
        else {
            console.log('Invalid password')
            res.status.set(403);
            res.send({_id: undefined});
            // Passwords don't match
        }
    }
    else {
        console.log('No user found');
        res.status.set(403);

        res.send({_id: undefined});
    }
})

app.get('/logout',(req,res) => {
    console.log(req.session, 'is the old session cookie')
    req.session = undefined;
    console.log(req.session, 'is the new session cookie')
    res.send({_id: undefined});
});

function getRandomInt(max) {
    console.log();
    return Math.floor(Math.random() * Math.floor(max));
}
