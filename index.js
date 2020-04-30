const express = require('express');
const app = express();
const port = 5004;

let undoValue = undefined;
let customer = {
    customerID: [getRandomInt(10),getRandomInt(10),getRandomInt(10),getRandomInt(10),].join(''),
    dateCreated: 1588050975,
    name: 'Ashish',
    number: '1234567890',
    gender: 'Male',
    deleting: false,
};

let bodyParser = require('body-parser');

app.use(bodyParser.json());

let customers = [customer,];

app.listen(port, () => {
    console.log(`Running on port ${port}`);
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});


app.get('/', (req, res) => {
    res.send('Hey there');
});

app.get('/customers', (req, res) => {
    res.send(customers);
});

app.get('/customers/:id', (req, res) => {
    console.log('requested id: ', req.params.id);
    let temp = customers.find(e => e.customerID === req.params.id);
    if (temp !== undefined)
    res.send(temp);
    else res.send('Customer not found');
});

app.post('/customer/delete/:id', (req, res) => {
    console.log('id for delete: ', req.body.id);
    let targetIndex = customers.findIndex(e => e.customerID === req.body.id);
    console.log(targetIndex, 'targetIndex')
    if(targetIndex !== -1){
        let temp = customers.splice(targetIndex, 1);
        undoValue = [temp[0], targetIndex];
        console.log('last user deleted: ', undoValue);
        res.send({idDeleted: temp.customerID});
    }
    else {
        res.send({idDeleted: null});
    }
});

app.get('/customer/undoDelete',(req, res) => {
    console.log('undoing changes');
    customers.splice(undoValue[1], 0, undoValue[0])
    res.send({userRestored: undoValue[0]});
    console.log('Response sent');
    undoValue = undefined;
});

app.post('/customer/add', (req, res) => {
    console.log('Body inside add are ', req.body);
    let id = [getRandomInt(10),getRandomInt(10),getRandomInt(10),getRandomInt(10),].join('');
    let temp = {
        customerID: id,
        name: req.body.name,
        number: req.body.number,
        gender: req.body.gender,
        deleting: false,
    };
    customers.push(temp);
    res.send({customerID: id});
});

function getRandomInt(max) {
    console.log();
    return Math.floor(Math.random() * Math.floor(max));
}