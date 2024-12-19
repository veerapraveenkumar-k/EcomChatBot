const express = require('express')
const { open } = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const bcrypt = require('bcrypt')
const jwt =  require('jsonwebtoken')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'ecommerce.db')
let db;

const dBConnection = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        console.log("DB Connected")
    } catch(e){
        console.log("Connection Error: ", e.message)
    }
}

app.listen(3000, () => {
    console.log('Server Running in PORT 3000')
    dBConnection()
})

const authentication = async (req, res, next) => {
    const authHeader = await req.headers['authorization']
    //console.log(req.headers)
    //console.log(authHeader)
    let jwtToken;
    if(authHeader !== undefined){
        jwtToken = authHeader.split(' ')[1]
    }
    if(jwtToken === undefined){
        //console.log(jwtToken)
        res.json({error_msg: "unauthorized"})
    }
    else {
        jwt.verify(jwtToken, 'MY_SECRET_KEY', (err, payload) => {
            if(err){
                res.json({error_msg: 'Bad Authorization'})
            } else {
                const {userName} = payload
                req.userName = userName
                next()
            }
        })
    }
}

app.get('/', authentication, async (req, res) => {
    try {
        const query = `SELECT * FROM users`
        const response = await db.all(query)
        console.log(response)
        res.send(response)
    } catch(e){
        console.log(e.message)
    }
})

app.post('/login', async (req, res) => {
    const {userName, password} = await req.body
    try{
        const selectUserQuery = `SELECT * FROM users
        WHERE user_name = '${userName}';
        `
        const user = await db.get(selectUserQuery)
        if(user === undefined){
            res.json({error_msg: "User Does not found"})
        } else {
            const isPassCorrect = await bcrypt.compare(password, user.password)
            console.log(isPassCorrect)
            if(isPassCorrect){
                const payload = {
                    userName: userName
                }
                const jwtToken = jwt.sign(payload, 'MY_SECRET_KEY')
                res.json({jwt_token: jwtToken})
            } else {
                res.json({error_msg: "User name and password didn't match"})
            }
        }
    } catch (e){
        console.log(e.message)
    }
})

app.post('/create-user', async (req, res) => {
    const {userName, password} = await req.body
    const hashedPass = await bcrypt.hash(password, 10)
    try {
        const createUserQuery = `
        INSERT INTO users(user_name, password)
        VALUES ('${userName}', '${hashedPass}');
        `
        const selectUserQuery = `SELECT * FROM users
        WHERE user_name = '${userName}';
        `
        const user = await db.get(selectUserQuery)
        if(user === undefined){
            if(password.length > 5){
                await db.run(createUserQuery)
                res.send('User Created')
            } else {
                res.json({error_msg: 'Password too short'})
            }
        } else {
            res.json({error_msg: 'User Already exists'})
        }
    } catch(e){
        console.log(e.message)
    }
})

