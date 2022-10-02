const express = require('express');
const app = express();
const port = 3000;
const router = express.Router();
const bodyParser = require('body-parser');
const mariadb = require('mariadb');
const pool = mariadb.createPool({
	host : 'localhost',
	user: 'root',
	password: 'password',
	database: 'sample',
	port: 3306,
	connectionLimit: 5
})

const swaggerUi = require('swagger-ui-express') 
const swaggerDocument = require('./swagger.json');

app.use(
'/docs',
swaggerUi.serve,
swaggerUi.setup(swaggerDocument)
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
extended: true
}));

pool.getConnection((err, connection) => {
	if(err){
		console.error('there is an error');
	}
	if(connection) connection.release();
	return;

});

app.use(function(req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin','*');
  next();
});

app.get('/avg_outstanding', async function (req, res) {
const sql_query = "select WORKING_AREA, avg(OUTSTANDING_AMT) as Average_Outstanding from customer group by WORKING_AREA"
const rows = await pool.query(sql_query, req.params.city);
res.status(200).json(rows);
})

app.get('/orders',async function (req, res) {
const sql_query = "select * from orders"
const rows = await pool.query(sql_query);
res.status(200).json(rows);
})

app.get('/order/:id',async function (req, res) {
const sql_query = "select * from orders where ORD_NUM = ?"
const rows = await pool.query(sql_query,req.params.id);
res.status(200).json(rows);
})

app.get('/agent_by_city/:city',async function (req, res) {
const city = req.params.city
const sql_query = "select AGENT_NAME from agents where WORKING_AREA = ?"
const rows = await pool.query(sql_query,[city]);
res.status(200).json(rows);
})

//Create Order API
app.post('/order/:id',async function (req, res) {
let ord_num = req.params.id
let ord_amount = req.body.ord_amount
let advance_amount = req.body.advance_amount
let ord_date = req.body.ord_date
let cust_code = req.body.cust_code
let agent_code = req.body.agent_code
let ord_description = req.body.ord_description

if (!ord_num) {
res.status(400).json({"message":"Please provide order number"});
}

const get_query = "select * from orders where ORD_NUM = ?"
const get_rows = await pool.query(get_query, [ord_num])

if (get_rows.length === 1){
res.status(403).json({"message":"Order already exists"});
}

const create_query = "insert into orders values(?, ?, ?, ?, ?, ?, ?)"
const rows = await pool.query(create_query, [ord_num, ord_amount, advance_amount, ord_date, cust_code, agent_code, ord_description])

res.status(200).json({"message" : "Order created"});
});

//Delete order API
app.delete('/order/:id', async function (req, res) {
let ord_num = req.params.id

const get_query = "select * from orders where ORD_NUM = ?"
const get_rows = await pool.query(get_query, [ord_num])

if (get_rows.length === 0){
res.status(404).json({"message":"Order does not exist"});
}

const delete_query = "delete from orders where ORD_NUM = ?"
const rows = await pool.query(delete_query, [ord_num])

res.status(200).json({"message":"Order deleted"});
});


//Patch order API
app.patch('/order/:id', async function (req, res) {

let ord_num = req.params.id
let ord_amount = req.body.ord_amount
let advance_amount = req.body.advance_amount
let ord_date = req.body.ord_date
let cust_code = req.body.cust_code
let agent_code = req.body.agent_code
let ord_description = req.body.ord_description

const get_query = "select * from orders where ORD_NUM = ?"
const get_rows = await pool.query(get_query, [ord_num])

if (get_rows.length === 0){
res.status(404).json({"message":"Order does not exist"});
}

const update_query = "update orders set ORD_AMOUNT = ?, ADVANCE_AMOUNT = ?, ORD_DATE = ?, CUST_CODE = ?, AGENT_CODE = ?, ORD_DESCRIPTION = ? where ORD_NUM = ?"
const rows = await pool.query(update_query, [ord_amount, advance_amount, ord_date, cust_code, agent_code, ord_description, ord_num])

res.status(200).json({"message":"Order Updated"});

});

//put order API
app.put('/order/:id', async function(req, res){

let ord_num = req.params.id
let ord_amount = req.body.ord_amount
let advance_amount = req.body.advance_amount
let ord_date = req.body.ord_date
let cust_code = req.body.cust_code
let agent_code = req.body.agent_code
let ord_description = req.body.ord_description

const get_query = "select * from orders where ORD_NUM = ?"
const get_rows = await pool.query(get_query, [ord_num])

if (get_rows.length === 0){
const create_query = "insert into orders values(?, ?, ?, ?, ?, ?, ?)"
const rows = await pool.query(create_query, [ord_num, ord_amount, advance_amount, ord_date, cust_code, agent_code, ord_description])
res.status(201).json({"message" : "Order created"});
}

const update_query = "update orders set ORD_AMOUNT = ?, ADVANCE_AMOUNT = ?, ORD_DATE = ?, CUST_CODE = ?, AGENT_CODE = ?, ORD_DESCRIPTION = ? where ORD_NUM = ?"
const rows = await pool.query(update_query, [ord_amount, advance_amount, ord_date, cust_code, agent_code, ord_description, ord_num])
res.status(200).json({"message":"Order Updated"}); 
});

app.listen(port, function () {
  console.log('App listening at http://localhost:%s', port)
});
